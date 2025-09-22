import express from "express";
import multer from "multer";
import {
  createBanner,
  getBanners,
  deleteBanner,
  updateBanner,
} from "../../controllers/productController/productMediaHandleController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" , limits: { fileSize: 10 * 1024 * 1024 } });


router.post(
  "/banner",
  upload.fields([
    { name: "banner_images", maxCount: 10 },
    { name: "advertise_images", maxCount: 10 },
  ]),
  createBanner
);

router.get("/banners", getBanners);

router.put(
  "/banner/:id",
  upload.fields([
    { name: "banner_images", maxCount: 10 },
    { name: "advertise_images", maxCount: 10 },
  ]),
  updateBanner
);

router.delete("/banner/:id", deleteBanner);

export default router;
