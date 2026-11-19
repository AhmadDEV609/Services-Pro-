
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import asyncHandler from "../helper/asynHandler.js";
import User, { type UserRole } from "../models/User.model.js";
import uploadToCloudinary from "../helper/uploadCloudinary.js";
import generateTokens from "../helper/generateTokens.js";

interface SignupBody {
    name: string;
    email: string;
    password: string;
    role: "user" | "provider";
}

interface LoginBody {
    email: string;
    password: string;
}

type AppRole = "user" | "provider" | "admin";

type AuthenticatedRequest = Request & {
    user?: {
        _id: mongoose.Types.ObjectId;
        role: AppRole;
    };
};

const isProduction = process.env.NODE_ENV === "production";

// Cookie configuration
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as
        "none" | "lax",
    path: "/",
};

// Set authentication cookies
const setAuthCookies = (
    res: Response,
    accessToken: string,
    refreshToken: string
) => {
    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
};

// Clear authentication cookies
const clearAuthCookies = (res: Response) => {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
};

// Signup
const signup = asyncHandler(
    async (
        req: Request<{}, {}, SignupBody>,
        res: Response
    ) => {
        const { name, email, password, role } = req.body;
        const image = req.file;

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image",
            });
        }

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        if (!["user", "provider"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered",
            });
        }

        const hashPassword = await bcrypt.hash(password, 12);

        const result = await uploadToCloudinary(
            image.buffer,
            "users"
        );

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashPassword,
            image: result.secure_url,
            public_id: result.public_id,
            role: role as UserRole,
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
            },
        });
    }
);

// Login
const login = asyncHandler(
    async (
        req: Request<{}, {}, LoginBody>,
        res: Response
    ) => {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        }).select("+password +refreshtoken");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const confirmPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!confirmPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const { accessToken, refreshToken } =
            generateTokens(user);

        user.refreshtoken = refreshToken;
        await user.save();

        // Remove any old cookies before setting new ones
        clearAuthCookies(res);

        setAuthCookies(res, accessToken, refreshToken);

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
            },
        });
    }
);

// Refresh Token
const refreshTokenController = asyncHandler(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            clearAuthCookies(res);

            return res.status(401).json({
                success: false,
                message: "Refresh token not found. Please login again.",
            });
        }

        const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

        if (!refreshSecret) {
            throw new Error(
                "REFRESH_TOKEN_SECRET is missing in .env"
            );
        }

        let decoded: jwt.JwtPayload;

        try {
            const verified = jwt.verify(
                refreshToken,
                refreshSecret
            );

            if (
                typeof verified === "string" ||
                !verified.userId
            ) {
                clearAuthCookies(res);

                return res.status(401).json({
                    success: false,
                    message: "Invalid refresh token",
                });
            }

            decoded = verified;
        } catch {
            clearAuthCookies(res);

            return res.status(401).json({
                success: false,
                message: "Refresh token expired or invalid. Please login again.",
            });
        }

        const user = await User.findById(decoded.userId)
            .select("+refreshtoken");

        if (!user || user.refreshtoken !== refreshToken) {
            clearAuthCookies(res);

            return res.status(401).json({
                success: false,
                message: "Invalid session. Please login again.",
            });
        }

        const {
            accessToken,
            refreshToken: newRefreshToken,
        } = generateTokens(user);

        user.refreshtoken = newRefreshToken;
        await user.save();

        setAuthCookies(
            res,
            accessToken,
            newRefreshToken
        );

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
        });
    }
);

// Get Logged-in User
const getUser = asyncHandler(
    async (
        req: AuthenticatedRequest,
        res: Response
    ) => {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
            },
        });
    }
);

// Logout
const logout = asyncHandler(
    async (
        req: AuthenticatedRequest,
        res: Response
    ) => {
        const userId = req.user?._id;

        try {
            if (userId) {
                await User.findByIdAndUpdate(userId, {
                    $unset: {
                        refreshtoken: 1,
                    },
                });
            }
        } finally {
            // Always clear browser cookies
            clearAuthCookies(res);
        }

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
);

export {
    signup,
    login,
    refreshTokenController,
    getUser,
    logout,
};
