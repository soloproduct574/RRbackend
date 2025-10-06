import express from "express";
import multer from "multer";
import{createCategory,deleteCategory,getCategories,updateCategory} from "../../controllers/productController/categoryCreateController.js"

const router = express.Router();

// multer setup
const upload = multer({ dest: "uploads/" });

// ✅ routes
router.post(
  "/categories",
  upload.fields([{ name: "category_images", maxCount: 10 }]),
  createCategory
);
router.get("/categories", getCategories);
router.put(
  "/categories/:id",
  upload.fields([{ name: "category_images", maxCount: 10 }]),
  updateCategory
);
router.delete("/categories/:id", deleteCategory);

export default router;
