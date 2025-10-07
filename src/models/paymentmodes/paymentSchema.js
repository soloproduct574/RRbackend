import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    alternateMobileNumber: {
      type: String,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit alternate number"],
    },
    shippingAddress: {
      type: String,
      required: [true, "Shipping address is required"],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      match: [/^[0-9]{6}$/, "Please enter a valid 6-digit pincode"],
    },
    paymentMode: {
      type: String, 
      enum: ["Cash on Delivery", "Credit Card", "Debit Card", "UPI", "Net Banking"],
      required: [true, "Please select payment mode"],
    },
    photo: {
      type: String, 
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
