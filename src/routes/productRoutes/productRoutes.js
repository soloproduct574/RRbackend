import express from "express";
import multer from "multer";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../../controllers/productController/productController.js";

const productrouter = express.Router();

// Ensure "uploads/tmp" folder exists before uploads start
const upload = multer({ dest: "uploads/tmp" });

// ✅ FIELD NAMES MUST MATCH FRONTEND
productrouter.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 10 }, // multiple image upload
    { name: "video", maxCount: 1 },   // single video (singular)
  ]),
  createProduct
);

productrouter.get("/", getProducts);
productrouter.get("/:id", getProducts);

productrouter.put(
  "/:id",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]),
  updateProduct
);

productrouter.delete("/:id", deleteProduct);

export default productrouter;
