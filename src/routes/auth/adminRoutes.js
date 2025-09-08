import express from "express";
import { registerAdmin, loginAdmin } from "../../controllers/auth/adminAuthController.js";

const adminrouter = express.Router();

adminrouter.post("/register", registerAdmin);
adminrouter.post("/login", loginAdmin);

export default adminrouter;
