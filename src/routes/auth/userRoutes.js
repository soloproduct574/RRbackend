import express from "express";
import { registerUser, loginUser , refreshAccessToken, getAllUsers, getUserById } from "../../controllers/auth/userControllerData.js";

const authrouter = express.Router();

// ✅ Public endpoints
authrouter.post("/register", registerUser);   
authrouter.post("/login", loginUser);           
authrouter.post("/refresh-token", refreshAccessToken); 

// ✅ No JWT required for GET requests
authrouter.get("/users", getAllUsers);   
authrouter.get("/user/:id", getUserById); 

export default authrouter;
