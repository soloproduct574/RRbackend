import Media from "../../models/media/mediaSchema.js";
import {
  uploadFileToR2,
  deleteFileFromR2,
} from "../../utils/r2uploadsControllers.js";

// ✅ Create Media
export const createMedia = async (req, res) => {
  try {
    const runningTextRaw = req.body?.runningText || "[]";
    let runningText = [];
    try {
      runningText = JSON.parse(runningTextRaw);
    } catch {
      runningText = [runningTextRaw];
    }

    const bannerFiles = req.files?.bannerImage || [];
    const bannerImageUrls = await Promise.all(
      bannerFiles.map((file) => uploadFileToR2(file.path, file.mimetype))
    );

    const normalFiles = req.files?.normalImage || [];
    const normalImageUrls = await Promise.all(
      normalFiles.map((file) => uploadFileToR2(file.path, file.mimetype))
    );

    const media = await Media.create({
      bannerImage: bannerImageUrls,
      normalImage: normalImageUrls,
      runningText,
    });

    res.status(201).json({ success: true, message: "Media created", data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Media
export const updateMediaById = async (req, res) => {
  try {
    const { runningText } = req.body;
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: "Not found" });

    // Replace Banner Images
    if (req.files?.bannerImage) {
      await Promise.all(media.bannerImage.map(url => deleteFileFromR2(url)));
      media.bannerImage = await Promise.all(
        req.files.bannerImage.map((file) => uploadFileToR2(file.path, file.mimetype))
      );
    }

    // Replace Normal Images
    if (req.files?.normalImage) {
      await Promise.all(media.normalImage.map(url => deleteFileFromR2(url)));
      media.normalImage = await Promise.all(
        req.files.normalImage.map((file) => uploadFileToR2(file.path, file.mimetype))
      );
    }

    // Update RunningText
    if (runningText) media.runningText = JSON.parse(runningText);

    await media.save();
    res.status(200).json({ success: true, message: "Media updated", data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get All
export const getAllMedia = async (req, res) => {
  try {
    const media = await Media.find();
    res.status(200).json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get By ID
export const getMediaById = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Media
export const deleteMediaById = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: "Not found" });

    await Promise.all([...media.bannerImage, ...media.normalImage].map(url => deleteFileFromR2(url)));
    await media.deleteOne();

    res.status(200).json({ success: true, message: "Media deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
