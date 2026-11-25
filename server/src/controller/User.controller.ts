
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

export type AppRole = "user" | "provider" | "admin";

export type AuthenticatedRequest = Request & {
    user?: {
        _id: mongoose.Types.ObjectId;
        role: AppRole;
    };
};

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
};
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

const clearAuthCookies = (res: Response) => {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
};

// SIGNUP
const signup = asyncHandler(
    async (
        req: Request<{}, {}, SignupBody>,
        res: Response
    ) => {
        const { name, email, password, role } = req.body;
        const image = req.file;

        if (!name?.trim() || !email?.trim() || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image",
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

// LOGIN
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

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const { accessToken, refreshToken } =
            generateTokens(user);

        user.refreshtoken = refreshToken;
        await user.save();

        clearAuthCookies(res);
        setAuthCookies(res, accessToken, refreshToken);

        return res.status(200).json({
            success: true,
            message: "Login successful",
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

// REFRESH TOKEN
const refreshTokenController = asyncHandler(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            clearAuthCookies(res);

            return res.status(401).json({
                success: false,
                message: "Refresh token not found",
                code: "REFRESH_TOKEN_MISSING",
            });
        }

        const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

        if (!refreshSecret) {
            throw new Error("REFRESH_TOKEN_SECRET is missing");
        }

        let decoded: jwt.JwtPayload;

        try {
            const verified = jwt.verify(
                refreshToken,
                refreshSecret
            );

            if (
                typeof verified === "string" ||
                typeof verified.userId !== "string"
            ) {
                throw new Error("Invalid refresh token payload");
            }

            decoded = verified;
        } catch {
            clearAuthCookies(res);

            return res.status(401).json({
                success: false,
                message: "Refresh token expired or invalid",
                code: "REFRESH_TOKEN_INVALID",
            });
        }

        if (!mongoose.isValidObjectId(decoded.userId)) {
            clearAuthCookies(res);

            return res.status(401).json({
                success: false,
                message: "Invalid user ID in token",
            });
        }

        const user = await User.findById(decoded.userId)
            .select("+refreshtoken");

        if (!user || user.refreshtoken !== refreshToken) {
            clearAuthCookies(res);

            return res.status(401).json({
                success: false,
                message: "Invalid refresh session",
                code: "REFRESH_SESSION_INVALID",
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

// GET LOGGED-IN USER
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

// LOGOUT
const logout = asyncHandler(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies?.refreshToken;
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

        try {
            if (refreshToken && refreshSecret) {
                try {
                    const decoded = jwt.verify(
                        refreshToken,
                        refreshSecret
                    );

                    if (
                        typeof decoded !== "string" &&
                        typeof decoded.userId === "string" &&
                        mongoose.isValidObjectId(decoded.userId)
                    ) {
                        await User.updateOne(
                            {
                                _id: decoded.userId,
                                refreshtoken: refreshToken,
                            },
                            {
                                $unset: { refreshtoken: 1 },
                            }
                        );
                    }
                } catch {

                }
            }
        } finally {
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
