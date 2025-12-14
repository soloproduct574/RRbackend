import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../../controllers/monitizations/userController.js";

const monUser = Router();

monUser.post("/", createUser);
monUser.get("/", getUsers);
monUser.get("/:id", getUserById);
monUser.put("/:id", updateUser);
monUser.delete("/:id", deleteUser);

export default monUser;
