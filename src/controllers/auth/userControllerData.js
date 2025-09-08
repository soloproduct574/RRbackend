import User from "../../models/auth/userData.js";
import jwt from "jsonwebtoken";

// ================= JWT HELPERS =================

// 🔑 Generate Access Token
const generateAccessToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES || "15m" } // short-lived access token
  );
};

// 🔑 Generate Refresh Token (longer expiration)
const generateRefreshToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
  );
};

// ================= REGISTER =================
export const registerUser = async (req, res) => {
  try {
    const { fullName, mobileNumber, email, password } = req.body;

    // ✅ Check required fields
    if (!fullName || !mobileNumber || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Create the user
    const newUser = await User.create({
      fullName,
      mobileNumber,
      email,
      password,
    });

    // ✅ Generate tokens
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // Optionally store refresh token in DB or Redis -> so you can revoke sessions
    // newUser.refreshToken = refreshToken;
    // await newUser.save();

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        customerId: newUser.customerId,
        fullName: newUser.fullName,
        mobileNumber: newUser.mobileNumber,
        email: newUser.email,
      },
      tokens: {
        access: accessToken,
        refresh: refreshToken,
      },
    });
  } catch (error) {
    console.error("❌ Register Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    // Explicitly select +password to compare, because schema has `select: false`
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // ✅ Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        customerId: user.customerId,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        email: user.email,
      },
      tokens: {
        access: accessToken,
        refresh: refreshToken,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= REFRESH TOKEN =================
export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = generateAccessToken(decoded.id);

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};
