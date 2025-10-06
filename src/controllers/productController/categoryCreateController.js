import ProductCategory from "../../models/product/categoryModelAdd.js";
import { uploadFileToR2 } from "../../utils/r2uploadsControllers.js"; // re‑use your upload util

// ✅ CREATE NEW CATEGORY
export const createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    if (!category_name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    let category_images = [];

    // ✅ handle file uploads
    if (req.files?.category_images) {
      for (const file of req.files.category_images) {
        const urls = await uploadFileToR2(file.path, file.mimetype);
        category_images.push(...urls);
      }
    }

    const category = await ProductCategory.create({
      category_name,
      category_images,
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error("❌ Category Create Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET ALL CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.find().sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name } = req.body;

    const updateData = {};
    if (category_name) updateData.category_name = category_name;

    // if new images
    if (req.files?.category_images) {
      let category_images = [];
      for (const file of req.files.category_images) {
        const urls = await uploadFileToR2(file.path, file.mimetype);
        category_images.push(...urls);
      }
      updateData.category_images = category_images;
    }

    const updatedCategory = await ProductCategory.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, category: updatedCategory });
  } catch (error) {
    console.error("❌ Category Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProductCategory.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("❌ Category Delete Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
