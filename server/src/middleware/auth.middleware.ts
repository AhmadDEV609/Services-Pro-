
import jwt from "jsonwebtoken";
import type {
    Request,
    Response,
    NextFunction,
} from "express";

import mongoose from "mongoose";

import asyncHandler from "../helper/asynHandler.js";
import User from "../models/User.model.js";

import type {
    AuthenticatedRequest,
} from "../controller/User.controller.js";

// ===============================
// AUTH MIDDLEWARE
// ===============================

const auth = asyncHandler(
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        const authReq = req as AuthenticatedRequest;

        // Get access token from cookie
        const token = req.cookies?.accessToken;

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Please log in first",
            });

        }

        const secret =
            process.env.ACCESS_TOKEN_SECRET;

        if (!secret) {

            throw new Error(
                "ACCESS_TOKEN_SECRET is missing"
            );

        }

        let decoded: jwt.JwtPayload;

        // Verify access token
        try {

            const verified = jwt.verify(
                token,
                secret
            );

            if (
                typeof verified === "string" ||
                typeof verified.userId !== "string"
            ) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid token payload",
                });

            }

            decoded = verified;

        } catch {

            return res.status(401).json({
                success: false,
                message: "Invalid or expired access token",
            });

        }

        // Validate user ID
        if (
            !mongoose.isValidObjectId(decoded.userId)
        ) {

            return res.status(401).json({
                success: false,
                message: "Invalid user ID",
            });

        }

        // Find user in database
        const user = await User.findById(
            decoded.userId
        ).select("_id role");

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "User not found",
            });

        }

        // Attach user to request
        authReq.user = {
            _id: user._id,
            role: user.role,
        };

        return next();

    }
);

// ===============================
// ADMIN MIDDLEWARE
// ===============================

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

export {
    adminOnly,
};

export default auth;
