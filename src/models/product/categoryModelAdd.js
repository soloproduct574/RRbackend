import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    category_name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    category_images: {
      type: [String], // array of image URLs
      default: [],
    },
  },
  { timestamps: true }
);

const ProductCategory = mongoose.model("ProductCategory", categorySchema);
export default ProductCategory;
