import express from "express";
import multer from "multer";
import { createProduct, getProducts, updateProduct, deleteProduct } from "../../controllers/productController/productController.js";

const productrouter = express.Router();

// Multer: store uploads in `uploads/tmp/`
const upload = multer({ dest: "uploads/tmp" });

// Single API with CRUD ops
productrouter.post("/", upload.fields([{ name: "images" }, { name: "videos" }]), createProduct);
productrouter.get("/", getProducts);
productrouter.get("/:id", getProducts);
productrouter.put("/:id", upload.fields([{ name: "images" }, { name: "videos" }]), updateProduct);
productrouter.delete("/:id", deleteProduct);

export default productrouter;
