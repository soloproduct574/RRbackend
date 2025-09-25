// controllers/bannerController.js
import ProductBanner from "../../models/product/productMedia.js";
import { uploadFileToR2 } from "../../utils/r2uploadsControllers.js";

// ✅ Create Banner
export const createBanner = async (req, res) => {
  try {
    const { title, redirect_urls, rotating_texts } = req.body;

    let banner_images = [];
    let advertise_images = [];

    // ✅ Handle banner images upload
    if (req.files?.banner_images) {
      for (const file of req.files.banner_images) {
        const urls = await uploadFileToR2(file.path, file.mimetype);
        banner_images.push(...urls);
      }
    }

    // ✅ Handle advertise images upload
    if (req.files?.advertise_images) {
      for (const file of req.files.advertise_images) {
        const urls = await uploadFileToR2(file.path, file.mimetype);
        advertise_images.push(...urls);
      }
    }

    // ✅ Parse arrays correctly
    const rotatingTextsArray = rotating_texts
      ? JSON.parse(rotating_texts)
      : [];

    const redirectUrlsArray = redirect_urls
      ? JSON.parse(redirect_urls)
      : [];

    const banner = await ProductBanner.create({
      title,
      rotating_texts: rotatingTextsArray,
      redirect_urls: redirectUrlsArray,
      banner_images,
      advertise_images,
    });

    res.status(201).json({ success: true, banner });
  } catch (err) {
    console.error("❌ Banner create error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Get All Banners
export const getBanners = async (req, res) => {
  try {
    const banners = await ProductBanner.find();
    res.json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update Banner
export const updateBanner = async (req, res) => {
  try {
    const { title, redirect_url, rotating_texts } = req.body;
    let updateData = { title, redirect_url };

    // Handle banner images update
    if (req.files?.banner_images) {
      let banner_images = [];
      for (const file of req.files.banner_images) {
        const urls = await uploadFileToR2(file.path, file.mimetype);
        banner_images.push(...urls);
      }
      updateData.banner_images = banner_images;
    }

    // Handle advertise images update
    if (req.files?.advertise_images) {
      let advertise_images = [];
      for (const file of req.files.advertise_images) {
        const urls = await uploadFileToR2(file.path, file.mimetype);
        advertise_images.push(...urls);
      }
      updateData.advertise_images = advertise_images;
    }

    // Handle rotating texts
    if (rotating_texts) {
      updateData.rotating_texts = JSON.parse(rotating_texts);
    }

    const banner = await ProductBanner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete Banner
export const deleteBanner = async (req, res) => {
  try {
    await ProductBanner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
