
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import asyncHandler from "../helper/asynHandler.js";
import User, { type UserRole } from "../models/User.model.js";
import uploadToCloudinary from "../helper/uploadCloudinary.js";
import generateTokens from "../helper/generateTokens.js";

// ===============================
// TYPES
// ===============================

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

// ===============================
// COOKIE CONFIGURATION
// ===============================

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
};

// SET COOKIES
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

// CLEAR COOKIES
const clearAuthCookies = (res: Response) => {

    res.clearCookie("accessToken", cookieOptions);

    res.clearCookie("refreshToken", cookieOptions);

};

// ===============================
// SIGNUP
// ===============================

export const signup = asyncHandler(
    async (
        req: Request<{}, {}, SignupBody>,
        res: Response
    ) => {

        const {
            name,
            email,
            password,
            role,
        } = req.body;

        const image = req.file;

        if (
            !name?.trim() ||
            !email?.trim() ||
            !password ||
            !role
        ) {

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

        const normalizedEmail =
            email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "Email is already registered",
            });

        }

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        const result = await uploadToCloudinary(
            image.buffer,
            "users"
        );

        const user = await User.create({

            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword,

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

// ===============================
// LOGIN
// ===============================

export const login = asyncHandler(
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

        const normalizedEmail =
            email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail,
        }).select("+password +refreshtoken");

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });

        }

        const passwordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordCorrect) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });

        }

        // Generate tokens
        const tokens = generateTokens(user);

        // Save refresh token in database
        user.refreshtoken = tokens.refreshToken;

        await user.save();

        // Set browser cookies
        setAuthCookies(
            res,
            tokens.accessToken,
            tokens.refreshToken
        );

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

// ===============================
// REFRESH TOKEN
// ===============================

export const refreshTokenController = asyncHandler(
    async (req: Request, res: Response) => {

        const token = req.cookies?.refreshToken;

        const secret =
            process.env.REFRESH_TOKEN_SECRET;

        if (!token) {

            clearAuthCookies(res);

            return res.status(401).json({

                success: false,

                message: "Refresh token not found",

                code: "REFRESH_TOKEN_MISSING",

            });

        }

        if (!secret) {
            throw new Error(
                "REFRESH_TOKEN_SECRET is missing"
            );
        }

        let decoded: jwt.JwtPayload;

        try {

            const verified = jwt.verify(
                token,
                secret
            );

            if (
                typeof verified === "string" ||
                typeof verified.userId !== "string"
            ) {

                throw new Error("Invalid token payload");

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

                message: "Invalid user ID",

            });

        }

        const user = await User.findById(
            decoded.userId
        ).select("+refreshtoken");

        if (
            !user ||
            user.refreshtoken !== token
        ) {

            clearAuthCookies(res);

            return res.status(401).json({

                success: false,

                message: "Invalid refresh session",

                code: "REFRESH_SESSION_INVALID",

            });

        }

        // Generate new tokens
        const tokens = generateTokens(user);

        // Rotate refresh token
        user.refreshtoken = tokens.refreshToken;

        await user.save();

        // Update browser cookies
        setAuthCookies(
            res,
            tokens.accessToken,
            tokens.refreshToken
        );

        return res.status(200).json({

            success: true,

            message: "Token refreshed successfully",

        });

    }
);

// ===============================
// GET LOGGED-IN USER
// ===============================

export const getUser = asyncHandler(
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

// ===============================
// LOGOUT
// ===============================

export const logout = asyncHandler(
    async (req: Request, res: Response) => {

        const token = req.cookies?.refreshToken;

        const secret =
            process.env.REFRESH_TOKEN_SECRET;

        if (token && secret) {

            try {

                const decoded = jwt.verify(
                    token,
                    secret
                );

                if (
                    typeof decoded !== "string" &&
                    typeof decoded.userId === "string" &&
                    mongoose.isValidObjectId(decoded.userId)
                ) {

                    await User.updateOne(

                        {
                            _id: decoded.userId,
                            refreshtoken: token,
                        },

                        {
                            $unset: {
                                refreshtoken: 1,
                            },
                        }

                    );

                }

            } catch (error) {

                console.error(
                    "Logout token verification:",
                    error
                );

            }

        }

        // Clear cookies
        clearAuthCookies(res);

        return res.status(200).json({

            success: true,

            message: "Logged out successfully",

        });

    }
);
