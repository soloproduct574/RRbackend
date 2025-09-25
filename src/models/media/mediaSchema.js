import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  normalImage: [{ type: String }],  // regular images
  bannerImage: [{ type: String }],  // banner images
  runningText: [{ type: String }],  // texts
}, { timestamps: true });

export default mongoose.model("Media", mediaSchema);
