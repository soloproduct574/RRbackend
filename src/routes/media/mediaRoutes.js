import express from "express";
import {createMedia,deleteMediaById,getAllMedia,getMediaById,updateMediaById} from "../../controllers/media/mediaController.js";
import { mediaUploadFields} from "../../midlewears/multer.js";

const router = express.Router();



router.post(
  "/",
  mediaUploadFields,
  createMedia
);
router.get("/", getAllMedia);
router.get("/:id", getMediaById);
router.put(
  "/:id",
  mediaUploadFields,
  updateMediaById
);
router.delete("/:id", deleteMediaById);

export default router;