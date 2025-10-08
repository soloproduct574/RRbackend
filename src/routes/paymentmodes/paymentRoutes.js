import express from "express";
import multer from "multer";

import {
  createPayment,
  getPayments,
  getPaymentById,
  updateOrderStatus,
  getOrderStats,
  deleteOrder,
} from "../../controllers/paymentmodes/payment.js";

const router = express.Router();

const upload = multer({dest:"uploads/"});

// ✅ Post route: normalize path before saving
router.post("/create", upload.single("photo"), createPayment);

// Other routes
router.get("/", getPayments);
router.get("/stats", getOrderStats);
router.get("/:id", getPaymentById);
router.put("/:id/status", updateOrderStatus);
router.delete("/:id", deleteOrder);



export default router;
