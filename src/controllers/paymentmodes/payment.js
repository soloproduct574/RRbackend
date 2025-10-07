import Payment from "../../models/paymentmodes/paymentSchema.js";
import path from "path";
import fs from "fs";

// Create a new payment
export const createPayment = async (req, res) => {
  try {
    const {
      name,
      mobileNumber,
      alternateMobileNumber,
      shippingAddress,
      pincode,
      paymentMode,
    } = req.body;

    const paymentModes = Array.isArray(paymentMode) ? paymentMode : [paymentMode];

    let photoPath = "";
    if (req.files && req.files.photo && req.files.photo.length > 0) {
      photoPath = req.files.photo[0].path; 
    }

    const newPayment = new Payment({
      name,
      mobileNumber,
      alternateMobileNumber,
      shippingAddress,
      pincode,
      paymentMode: paymentModes,
      photo: photoPath,
    });

    const savedPayment = await newPayment.save();

    res.status(201).json({
      success: true,
      message: "Payment details saved successfully",
      data: savedPayment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to save payment details",
      error: error.message,
    });
  }
};

// Get all payments (optional)
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment by ID (optional)
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
