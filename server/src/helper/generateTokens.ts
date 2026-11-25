
import jwt from "jsonwebtoken";
import type { IUser } from "../models/User.model.js";

const generateTokens = (user: IUser & { _id: unknown }) => {
    const accessSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!accessSecret || !refreshSecret) {
        throw new Error("JWT secrets are missing in environment variables");
    }

    const payload = {
        userId: String(user._id),
        email: user.email,
        role: user.role,
    };

    const accessToken = jwt.sign(
        payload,
        accessSecret,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        payload,
        refreshSecret,
        { expiresIn: "30d" }
    );

    return { accessToken, refreshToken };
};

export default generateTokens;
