import { Router } from "express";
import { loginUser } from "../../controllers/monitizations/authController.js";

const monauth = Router();

monauth.post("/login", loginUser);

export default monauth;
