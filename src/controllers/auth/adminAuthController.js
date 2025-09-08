import Admin from "../../models/auth/adminDataSchema.js";
import jwt from "jsonwebtoken";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.ADMIN_JWT_SECRET || "adminsecretkey", {
    expiresIn: "7d",
  });

// ================= ADMIN REGISTER =================
export const registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Check if admin already exists
    const adminExists = await Admin.findOne({ $or: [{ email }, { username }] });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const newAdmin = await Admin.create({ username, email, password });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
      },
      token: generateToken(newAdmin._id),
    });
  } catch (err) {
    console.error("Register Admin Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= ADMIN LOGIN =================
export const loginAdmin = async (req, res) => {
  try {
    const { login, password } = req.body; // login = username OR email

    if (!login || !password) {
      return res.status(400).json({ message: "Login and password are required" });
    }

    // Find admin by username OR email
    const admin = await Admin.findOne({
      $or: [{ email: login }, { username: login }],
    }).select("+password");

    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    return res.json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
      token: generateToken(admin._id),
    });
  } catch (err) {
    console.error("Login Admin Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
