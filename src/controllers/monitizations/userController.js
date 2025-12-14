import User from "../../models/monitizationmodels/userCreateModesl.js";
import bcrypt from "bcryptjs";

// CREATE USER
export const createUser = async (req, res) => {
  try {
    const { username, password, name, role } = req.body;

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPass,
      name,
      role: role || "user"
    });

    res.json({ msg: "User created", user: newUser });
  } catch (err) {
    res.status(500).json({ msg: "Error creating user", error: err });
  }
};

// GET ALL USERS
export const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

// GET ONE USER
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
};

// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    if (password) rest.password = await bcrypt.hash(password, 10);

    const updated = await User.findByIdAndUpdate(req.params.id, rest, { new: true });

    res.json({ msg: "User updated", user: updated });
  } catch (err) {
    res.status(500).json({ msg: "Error updating user", error: err });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: "User deleted" });
};
