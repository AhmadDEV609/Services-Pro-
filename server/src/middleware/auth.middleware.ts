
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import asyncHandler from "../helper/asynHandler.js";
import User from "../models/User.model.js";
import generateTokens from "../helper/generateTokens.js";
type AppRole = "user" | "provider" | "admin";

type AuthenticatedRequest = Request & {
    user?: {
        _id: mongoose.Types.ObjectId;
        role: AppRole;
    };
};

const auth = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthenticatedRequest;
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please log in first",
            });
        }

        const secret = process.env.ACCESS_TOKEN_SECRET;

        if (!secret) {
            throw new Error("ACCESS_TOKEN_SECRET is missing");
        }

        let decoded: string | jwt.JwtPayload;

        try {
            decoded = jwt.verify(token, secret);
        } catch {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired access token",
            });
        }

        if (
            typeof decoded === "string" ||
            typeof decoded.userId !== "string"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload",
            });
        }

        const user = await User.findById(decoded.userId).select("_id role");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        authReq.user = {
            _id: user._id,
            role: user.role,
        };

        return next();
    }
);

const adminOnly = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    if (authReq.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access only",
        });
    }

    return next();
};


const generateNewToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) {
        return res.status(404).json({
            success: false,
            message: "token is not found",
        });
    }
    const refresh_token = process.env.REFRESH_JWT_SECRET
    if (!refresh_token) {
        return res.status(404).json({
            success: false,
            message: "token is not found",
        });
    }
    const decode = jwt.verify(refreshToken, refresh_token)
    if (typeof decode === "string" || typeof decode.id !== "string") {
        return res.status(404).json({
            success: false,
            message: "invalid type of token",
        });
    }
    const user = await User.findById(decode.id)
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "user not found",
        });
    }
    if (user.refreshtoken !== refreshToken) {
        return res.status(404).json({
            success: false,
            message: "token is not found",
        });
    }

    const { accessToken } = generateTokens(user)

    res.cookie('accessToken', accessToken, {
        maxAge: 1000 * 60 * 15,
        httpOnly: true,
        secure: true,
        sameSite: "none",
    })

    res.status(200).json({
        message: 'token is updated',
    })

})

export { adminOnly };
export default auth;
export { generateNewToken }