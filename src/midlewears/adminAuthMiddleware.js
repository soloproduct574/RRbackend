import jwt from "jsonwebtoken";
import adminDataSchema from "../models/auth/adminDataSchema.js";


export const protectAdmin = async (req, res, next) => {
  try {
    let token;

    // ✅ Check if Authorization header exists and starts with "Bearer"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || "adminsecretkey");

    // ✅ Attach admin data to req
    const admin = await adminDataSchema.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ success: false, message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("❌ JWT verification failed:", error.message);

    // Handle expired token error separately (useful for frontend UX)
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired, please login again" });
    }

    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};
