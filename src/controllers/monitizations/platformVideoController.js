import PlatformVideo from "../../models/monitizationmodels/PlatformVideo.js";

// CREATE
export const createPlatformVideo = async (req, res) => {
  try {
    const { platformName, videoUrl, message } = req.body;

    if (!platformName || !videoUrl || !message) {
      return res.status(400).json({
        msg: "All fields are required",
      });
    }

    const newItem = new PlatformVideo({
      platformName,
      videoUrl,
      message,
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);

  } catch (err) {
    console.error("Create Error:", err);
    res.status(400).json({
      msg: "Error creating platform video",
      error: err.message || err,
    });
  }
};

// GET ALL
export const getAllPlatformVideos = async (req, res) => {
  try {
    const items = await PlatformVideo.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET ONE
export const getPlatformVideoById = async (req, res) => {
  try {
    const item = await PlatformVideo.findById(req.params.id);
    if (!item)
      return res.status(404).json({ msg: "PlatformVideo not found" });

    res.status(200).json(item);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// UPDATE
export const updatePlatformVideo = async (req, res) => {
  try {
    const { platformName, videoUrl, message } = req.body;

    const updatedItem = await PlatformVideo.findByIdAndUpdate(
      req.params.id,
      { platformName, videoUrl, message },
      { new: true }
    );

    if (!updatedItem)
      return res.status(404).json({ msg: "PlatformVideo not found" });

    res.status(200).json(updatedItem);

  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// DELETE
export const deletePlatformVideo = async (req, res) => {
  try {
    const deleted = await PlatformVideo.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ msg: "PlatformVideo not found" });

    res.status(200).json({ msg: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
