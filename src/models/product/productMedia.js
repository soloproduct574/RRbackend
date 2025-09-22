// models/ProductBanner.js
import mongoose from "mongoose";

const productBannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    // Banner images (main slider banners)
    banner_images: [{ type: String }],

    // Advertise images (side ads / promotional blocks)
    advertise_images: [{ type: String }],

    // Rotating promotional texts
    rotating_texts: [{ type: String }],

    // Optional redirect URL (if clicking banner should redirect)
    redirect_urls: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("ProductBanner", productBannerSchema);
