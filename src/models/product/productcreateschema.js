import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid"; // Import UUID

const ProductSchema = new mongoose.Schema({
     customerId: {
          type: String,
          unique: true,
          default: () => uuidv4(), // Auto-generate UUID
        },
  product_name: {
    type: String,
    required: true,
    trim: true
  },
  description: { type: String, trim: true },
  percentage_discount: { type: Number, required: true },

  product_images: [{ type: String, required: true }],
  product_videos: [{ type: String, required: true }],

  original_price: { type: Number, required: true },
  offer_price: { type: Number, required: true },

  // Categories embedded
  categories: [
    { name: { type: String, required: true, trim: true } }
  ],
  // Brands embedded
  // brands: [
  //   { name: { type: String, required: true, trim: true } }
  // ]
}, { timestamps: true });

const Product = mongoose.model("Product", ProductSchema);

export default Product;
