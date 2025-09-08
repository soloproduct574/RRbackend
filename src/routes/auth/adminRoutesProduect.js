import express from "express";
import {protectAdmin}  from "../../midlewears/adminAuthMiddleware.js";

const router = express.Router();

router.get("/admin/dashboard", protectAdmin, (req, res) => {
  res.json({
    success: true,
    message: `Welcome Admin ${req.admin.username}`,
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
    },
  });
});

export default router;
