import express from "express";
import path from "path";
import { mediaUploadFields } from "../../midlewears/multer.js";
import { createPayment, getPayments, getPaymentById } from "../../controllers/paymentmodes/payment.js";

const router = express.Router();

// Create a new payment (with photo upload)
router.post("/create", mediaUploadFields, createPayment);

// Get all payments
router.get("/", getPayments);

// Get a payment by ID
router.get("/:id", getPaymentById);

export default router;