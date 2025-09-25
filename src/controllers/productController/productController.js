import Product from "../../models/product/productcreateschema.js";
import {uploadFileToR2,deleteFileFromR2,generateSignedUrl}  from "../../utils/r2uploadsControllers.js";

console.log("Product Controller Loaded",uploadFileToR2);
/**
 * CREATE a product
 */
export const createProduct = async (req, res) => {
  try {
    const { product_name, description, original_price, offer_price, categories } = req.body;

    // Auto calculate discount
    const percentage_discount = Math.round(((original_price - offer_price) / original_price) * 100);

    let images = [];
    let videos = [];

    if (req.files?.images) {
      for (const file of req.files.images) {
        const urls = await uploadFileToR2(file.path, file.mimetype);
        images.push(...urls);
      }
    }

    if (req.files?.videos) {
      for (const file of req.files.videos) {
        const urls = await uploadFileToR2(file.path, file.mimetype);
        videos.push(...urls);
      }
    }

    const product = await Product.create({
      product_name,
      description,
      original_price,
      offer_price,
      percentage_discount,
      product_images: images,
      product_videos: videos,
      categories: parsedCategories,
    });

    res.status(201).json({ success: true, product });

  } catch (err) {
    console.error("❌ Create error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET all or single product
 */
export const getProducts = async (req, res) => {
  try {
    if (req.params.id) {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ success: false, message: "Not found" });
      return res.json({ success: true, product });
    }

    const products = await Product.find();
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPDATE a product
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Not found" });

    const { product_name, description, original_price, offer_price, categories } = req.body;

    let images = product.product_images;
    let videos = product.product_videos;

    if (req.files?.images) {
      for (const file of req.files.images) {
        const urls = await uploadFileToR2(file.path, file.mimetype);
        images.push(...urls);
      }
    }

    if (req.files?.videos) {
      for (const file of req.files.videos) {
        const urls = await uploadFileToR2(file.path, file.mimetype);
        videos.push(...urls);
      }
    }

    // update fields
    product.set({
      product_name: product_name || product.product_name,
      description: description || product.description,
      original_price: original_price || product.original_price,
      offer_price: offer_price || product.offer_price,
      percentage_discount: (original_price && offer_price)
        ? Math.round(((original_price - offer_price) / original_price) * 100)
        : product.percentage_discount,
      product_images: images,
      product_videos: videos,
      categories: categories ? JSON.parse(categories) : product.categories,
      // brands: brands ? JSON.parse(brands) : product.brands
    });

    await product.save();

    res.json({ success: true, product });

  } catch (err) {
    console.error("❌ Update error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE product
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Not found" });

    // delete R2 files too
    for (const url of [...product.product_images, ...product.product_videos]) {
      const key = url.split(process.env.R2_PUBLIC_URL + "/")[1];
      if (key) await deleteFileFromR2(key).catch(() => {});
    }

    await product.deleteOne();

    res.json({ success: true, message: "Deleted" });

  } catch (err) {
    console.error("❌ Delete error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
