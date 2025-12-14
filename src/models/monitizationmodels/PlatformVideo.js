import mongoose from "mongoose";

const PlatformVideoSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      // required: true,
    },
    videoUrl: {
      type: String,
      // required: true,
    },
    message: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PlatformVideohandlemonz", PlatformVideoSchema);
