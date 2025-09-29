import Product from "../../models/product/productcreateschema.js";
import {uploadFileToR2,deleteFileFromR2,generateSignedUrl}  from "../../utils/r2uploadsControllers.js";

console.log("Product Controller Loaded",uploadFileToR2);
/**
 * CREATE a product
 */
export const createProduct = async (req, res) => {
  try {
    const { product_name, description, original_price, offer_price, categories, brands } = req.body;

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
      categories: categories ? JSON.parse(categories) : [],
      brands: brands ? JSON.parse(brands) : []
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

    console.log("Request body:", JSON.stringify(req.body));

    // Handle standard fields first
    if (req.body.product_name !== undefined) product.product_name = req.body.product_name;
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.original_price !== undefined) product.original_price = Number(req.body.original_price);
    if (req.body.offer_price !== undefined) product.offer_price = Number(req.body.offer_price);
    if (req.body.percentage_discount !== undefined) product.percentage_discount = Number(req.body.percentage_discount);

    // Handle arrays that don't need special formatting
    if (req.body.product_images) {
      if (Array.isArray(req.body.product_images)) {
        product.product_images = req.body.product_images;
      } else if (typeof req.body.product_images === 'string') {
        try {
          product.product_images = JSON.parse(req.body.product_images);
        } catch (e) {
          console.log("Error parsing product_images:", e);
        }
      }
    }
    
    if (req.body.product_videos) {
      if (Array.isArray(req.body.product_videos)) {
        product.product_videos = req.body.product_videos;
      } else if (typeof req.body.product_videos === 'string') {
        try {
          product.product_videos = JSON.parse(req.body.product_videos);
        } catch (e) {
          console.log("Error parsing product_videos:", e);
        }
      }
    }

    // ===== CRITICAL FIX FOR CATEGORIES =====
    if (req.body.categories) {
      // Create a completely new array
      const newCategories = [];
      
      // Convert to object based on type
      if (typeof req.body.categories === 'string') {
        try {
          // First try to parse it as JSON
          const parsed = JSON.parse(req.body.categories);
          
          if (Array.isArray(parsed)) {
            // It's a JSON array
            parsed.forEach(cat => {
              if (typeof cat === 'string') {
                newCategories.push({ name: cat });
              } else if (cat && cat.name) {
                newCategories.push({ name: cat.name });
              }
            });
          } else {
            // It's a single value
            newCategories.push({ name: String(parsed) });
          }
        } catch (e) {
          // It's a regular string, not JSON
          newCategories.push({ name: req.body.categories });
        }
      } else if (Array.isArray(req.body.categories)) {
        // It's already an array
        req.body.categories.forEach(cat => {
          if (typeof cat === 'string') {
            newCategories.push({ name: cat });
          } else if (cat && cat.name) {
            newCategories.push({ name: cat.name });
          }
        });
      }
      
      // Important: Directly replace the categories array
      product.categories = newCategories;
      console.log("Final categories:", newCategories);
    }

    // ===== CRITICAL FIX FOR BRANDS =====
    if (req.body.brands) {
      // Create a completely new array
      const newBrands = [];
      
      // Convert to object based on type
      if (typeof req.body.brands === 'string') {
        try {
          // First try to parse it as JSON
          const parsed = JSON.parse(req.body.brands);
          
          if (Array.isArray(parsed)) {
            // It's a JSON array
            parsed.forEach(brand => {
              if (typeof brand === 'string') {
                newBrands.push({ name: brand });
              } else if (brand && brand.name) {
                newBrands.push({ name: brand.name });
              }
            });
          } else {
            // It's a single value
            newBrands.push({ name: String(parsed) });
          }
        } catch (e) {
          // It's a regular string, not JSON
          newBrands.push({ name: req.body.brands });
        }
      } else if (Array.isArray(req.body.brands)) {
        // It's already an array
        req.body.brands.forEach(brand => {
          if (typeof brand === 'string') {
            newBrands.push({ name: brand });
          } else if (brand && brand.name) {
            newBrands.push({ name: brand.name });
          }
        });
      }
      
      // Important: Directly replace the brands array
      product.brands = newBrands;
      console.log("Final brands:", newBrands);
    }

    // Handle file uploads
    if (req.files) {
      // Handle image uploads
      if (req.files.images && req.files.images.length > 0) {
        const newImages = [];
        for (const file of req.files.images) {
          try {
            const urls = await uploadFileToR2(file.path, file.mimetype);
            newImages.push(...urls);
          } catch (error) {
            console.error("Error uploading image:", error);
          }
        }
        
        // Combine with existing images
        if (newImages.length > 0) {
          if (!product.product_images || !Array.isArray(product.product_images)) {
            product.product_images = [];
          }
          product.product_images = [...product.product_images, ...newImages];
        }
      }
      
      // Handle video uploads
      if (req.files.videos && req.files.videos.length > 0) {
        const newVideos = [];
        for (const file of req.files.videos) {
          try {
            const urls = await uploadFileToR2(file.path, file.mimetype);
            newVideos.push(...urls);
          } catch (error) {
            console.error("Error uploading video:", error);
          }
        }
        
        // Combine with existing videos
        if (newVideos.length > 0) {
          if (!product.product_videos || !Array.isArray(product.product_videos)) {
            product.product_videos = [];
          }
          product.product_videos = [...product.product_videos, ...newVideos];
        }
      }
    }

    // Save with validation
    const updatedProduct = await product.save();
    console.log("Product updated successfully");

    return res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (err) {
    console.error("❌ Update error:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message
    });
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
