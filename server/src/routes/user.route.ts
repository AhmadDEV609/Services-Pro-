
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

userRoute.post("/signup", upload.single("image"), signup);

userRoute.post("/login", login);

userRoute.post("/refreshToken", refreshTokenController);

userRoute.get("/getUser", auth, getUser);

userRoute.post("/logout", logout);

export default userRoute;
