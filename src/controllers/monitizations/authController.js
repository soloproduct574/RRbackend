import User from "../../models/monitizationmodels/userCreateModesl.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check username
    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ msg: "User not found" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Wrong password" });

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err });
  }
};
