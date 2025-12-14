import express from "express";

import {
  createPlatformVideo,
  getAllPlatformVideos,
  getPlatformVideoById,
  updatePlatformVideo,
  deletePlatformVideo,
} from "../../controllers/monitizations/platformVideoController.js";

const monVideo = express.Router();

monVideo.post("/", createPlatformVideo);
monVideo.get("/", getAllPlatformVideos);
monVideo.get("/:id", getPlatformVideoById);
monVideo.put("/:id", updatePlatformVideo);
monVideo.delete("/:id", deletePlatformVideo);

export default monVideo;
