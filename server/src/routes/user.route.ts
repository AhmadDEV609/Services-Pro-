import { Router } from "express";

import upload from "../middleware/multer.middleware.js";

import {
    signup,
    login,
    getUser,
    refreshTokenController,
    logout,
} from "../controller/User.controller.js";

import auth from "../middleware/auth.middleware.js";

const userRoute = Router();

// Signup
userRoute.post("/signup", upload.single("image"), signup);

// Login
userRoute.post("/login", login);

// Refresh access token
userRoute.post("/refreshToken", refreshTokenController);

// Get logged-in user
userRoute.get("/getUser", auth, getUser);

// Logout
userRoute.post("/logout", auth, logout);

export default userRoute;