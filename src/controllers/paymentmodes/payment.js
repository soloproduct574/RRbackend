import Payment from "../../models/paymentmodes/paymentSchema.js";
import fs from "fs";
import { uploadFileToR2 } from "../../utils/r2uploadsControllers.js"; // 👈 ensure this path matches your R2 utility


/**
 * @desc Create a new payment (order placement)
 * @route POST /api/payments
 * @access Public
 */
export const createPayment = async (req, res) => {
  try {
    const {
      name,
      mobileNumber,
      alternateMobileNumber,
      shippingAddress,
      pincode,
      paymentMode,
      cartItems,
      orderSummary,
      orderNotes = "",
    } = req.body;

    // ✅ Required field validation
    const requiredFields = {
      name,
      mobileNumber,
      shippingAddress,
      pincode,
      paymentMode,
      cartItems,
      orderSummary,
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, val]) => !val || (typeof val === "string" && val.trim() === ""))
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // ✅ Format validations
    const mobileRegex = /^\d{10}$/;
    const pincodeRegex = /^\d{6}$/;

    if (!mobileRegex.test(mobileNumber.trim())) {
      return res.status(400).json({ success: false, message: "Invalid mobile number format" });
    }

    if (alternateMobileNumber && !mobileRegex.test(alternateMobileNumber.trim())) {
      return res.status(400).json({ success: false, message: "Invalid alternate mobile number format" });
    }

    if (!pincodeRegex.test(pincode.trim())) {
      return res.status(400).json({ success: false, message: "Invalid pincode format" });
    }

    // ✅ Validate payment mode
    const validModes = ["Cash on Delivery", "Credit Card", "Debit Card", "UPI", "Net Banking"];
    const cleanPaymentMode = Array.isArray(paymentMode) ? paymentMode[0] : paymentMode.trim();
    if (!validModes.includes(cleanPaymentMode)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment mode: ${cleanPaymentMode}`,
      });
    }

    // ✅ Parse JSON fields
    let parsedCartItems = [];
    let parsedOrderSummary = {};
    try {
      parsedCartItems = typeof cartItems === "string" ? JSON.parse(cartItems) : cartItems;
      parsedOrderSummary = typeof orderSummary === "string" ? JSON.parse(orderSummary) : orderSummary;
    } catch (jsonErr) {
      return res.status(400).json({
        success: false,
        message: `Invalid JSON format: ${jsonErr.message}`,
      });
    }

    if (!Array.isArray(parsedCartItems) || parsedCartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart items must be a non-empty array",
      });
    }

    // ✅ Handle proof image upload (if provided)
    let paymentProofUrl = "";
    if (req.file) {
      try {
        const urls = await uploadFileToR2(req.file.path, req.file.mimetype);
        paymentProofUrl = urls?.[0] || "";
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); // cleanup local file
      } catch (uploadErr) {
        console.error("File upload error:", uploadErr);
        return res.status(500).json({
          success: false,
          message: "Failed to upload payment proof",
        });
      }
    }

    // ✅ Transform cart items
    const orderItems = parsedCartItems.map((item, idx) => ({
      productId: String(item._id || item.id || `item_${idx}`),
      productName: item.name || item.product_name || `Product ${idx + 1}`,
      productImage: item.product_images?.[0] || item.image || "",
      brand: item.brands?.[0]?.name || item.brand || "Unknown",
      originalPrice: parseFloat(item.original_price || 0),
      offerPrice: item.offer_price ? parseFloat(item.offer_price) : null,
      quantity: parseInt(item.quantity || 1),
      itemTotal: parseFloat(((item.offer_price || item.original_price) * (item.quantity || 1)).toFixed(2)),
    }));

    // ✅ Prepare order summary
    const processedOrderSummary = {
      subtotal: parseFloat(parsedOrderSummary.subtotal),
      tax: parseFloat(parsedOrderSummary.tax),
      shipping: parseFloat(parsedOrderSummary.shipping),
      total: parseFloat(parsedOrderSummary.total),
      itemCount: parseInt(parsedOrderSummary.itemCount),
      currency: parsedOrderSummary.currency || "INR",
    };

    // ✅ Save to MongoDB
    const paymentDoc = await Payment.create({
      name: name.trim(),
      mobileNumber: mobileNumber.trim(),
      alternateMobileNumber: alternateMobileNumber?.trim() || "",
      shippingAddress: shippingAddress.trim(),
      pincode: pincode.trim(),
      paymentMode: cleanPaymentMode,
      photo: paymentProofUrl,
      orderItems,
      orderSummary: processedOrderSummary,
      orderNotes: orderNotes.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully 🎉",
      data: {
        orderId: paymentDoc._id,
        orderNumber: paymentDoc.orderNumber,
        paymentMode: paymentDoc.paymentMode,
        orderStatus: paymentDoc.orderStatus,
        paymentStatus: paymentDoc.paymentStatus,
        total: paymentDoc.orderSummary.total,
        estimatedDelivery: paymentDoc.estimatedDelivery,
      },
    });
  } catch (err) {
    console.error("Create Payment Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create payment",
    });
  }
};
// Get all payments with advanced filtering and pagination
export const getPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (req.query.orderStatus) {
      filter.orderStatus = req.query.orderStatus;
    }
    
    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }
    
    if (req.query.paymentMode) {
      filter.paymentMode = req.query.paymentMode;
    }
    
    if (req.query.mobile) {
      filter.mobileNumber = { $regex: req.query.mobile, $options: 'i' };
    }
    
    if (req.query.orderNumber) {
      filter.orderNumber = { $regex: req.query.orderNumber, $options: 'i' };
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Sort options
    let sort = { createdAt: -1 }; // Default: newest first
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [sortField]: sortOrder };
    }

    const [orders, totalCount] = await Promise.all([
      Payment.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Payment.countDocuments(filter)
    ]);

    // Calculate summary statistics
    const summaryStats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$orderSummary.total' },
          avgOrderValue: { $avg: '$orderSummary.total' },
          totalItems: { $sum: '$orderSummary.itemCount' },
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
          limit,
        },
        summary: summaryStats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          totalItems: 0,
        },
        filter: filter,
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get payment by ID with detailed information
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Get payment by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, orderNotes } = req.body;

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (orderNotes !== undefined) updateData.orderNotes = orderNotes;

    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order",
      error: error.message,
    });
  }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalValue: { $sum: '$orderSummary.total' },
        }
      }
    ]);

    const paymentStats = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentMode',
          count: { $sum: 1 },
          totalValue: { $sum: '$orderSummary.total' },
        }
      }
    ]);

    // Monthly revenue for the last 12 months
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$orderSummary.total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        orderStatusStats: stats,
        paymentModeStats: paymentStats,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};

// Delete order (soft delete by updating status)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedOrder = await Payment.findByIdAndUpdate(
      id,
      { orderStatus: 'Cancelled', paymentStatus: 'Refunded' },
      { new: true }
    );

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: deletedOrder,
    });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};
