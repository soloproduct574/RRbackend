import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  productImage: {
    type: String,
    default: "",
  },
  brand: {
    type: String,
    default: "Unknown",
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  offerPrice: {
    type: Number,
    default: null,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  itemTotal: {
    type: Number,
    required: true,
    min: 0,
  },
});

const orderSummarySchema = new mongoose.Schema({
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
  },
  shipping: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  itemCount: {
    type: Number,
    required: true,
    min: 1,
  },
  currency: {
    type: String,
    default: "INR",
  },
});

const paymentSchema = new mongoose.Schema(
  {
    // Customer Details
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    alternateMobileNumber: {
      type: String,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit alternate number"],
      default: "",
    },
    shippingAddress: {
      type: String,
      required: [true, "Shipping address is required"],
      trim: true,
      minlength: 10,
      maxlength: 500,
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      match: [/^[0-9]{6}$/, "Please enter a valid 6-digit pincode"],
    },
    
    // Payment Details
    paymentMode: {
      type: String,
      enum: ["Cash on Delivery", "Credit Card", "Debit Card", "UPI", "Net Banking"],
      required: [true, "Please select payment mode"],
    },
    photo: {
      type: String,
      default: "",
    },
    
    // Order Details
    orderItems: [orderItemSchema],
    orderSummary: orderSummarySchema,
    
    // Order Status
    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    
    // Order Number (Auto-generated)
    orderNumber: {
      type: String,
      unique: true,
    },
    
    // Payment Status
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    // Additional fields for better tracking
    estimatedDelivery: {
      type: Date,
      default: function() {
        const now = new Date();
        return new Date(now.setDate(now.getDate() + 7)); // 7 days from order
      }
    },
    
    // Order notes (optional)
    orderNotes: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  { 
    timestamps: true,
  }
);

// Auto-generate order number before saving
paymentSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD${timestamp}${random}`;
  }
  next();
});

// Add indexes for better query performance
paymentSchema.index({ orderNumber: 1 });
paymentSchema.index({ mobileNumber: 1 });
paymentSchema.index({ orderStatus: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.model("Payment", paymentSchema);
