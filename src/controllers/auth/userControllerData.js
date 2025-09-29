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
export const 
registerUser = async (req, res) => {
  try {
    const { fullName, mobileNumber, email } = req.body;

    // ✅ Check required fields (only the ones you actually need)
    if (!fullName || !mobileNumber || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Create the user (without password)
    const newUser = await User.create({
      fullName,
      mobileNumber,
      email,
    });

    // ✅ Generate tokens (optional - if you still want authentication without passwords)
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

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
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        message: `${field} already exists` 
      });
    }
    
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
// ================= GET ALL USERS =================
export const getAllUsers = async (req, res) => {
  try {
    // Exclude password field (safe even if it doesn't exist)
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ Get Users Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET USER BY ID =================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("❌ Get User Error:", error);
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
