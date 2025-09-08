import express from "express";
import { registerUser, loginUser , refreshAccessToken} from "../../controllers/auth/userControllerData.js";
import { verifyJWT } from "../../midlewears/authMiddlewears.js";

const authrouter = express.Router();

// ✅ Public endpoints
authrouter.post("/register", registerUser);   // will become /rr_traders/auth/register
authrouter.post("/login", loginUser);           // will become /rr_traders/auth/login
authrouter.post("/refresh-token", refreshAccessToken); // will become /rr_traders/auth/refresh-token

export default authrouter;
