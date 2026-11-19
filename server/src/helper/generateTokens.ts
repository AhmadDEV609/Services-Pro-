import jwt from "jsonwebtoken";

const generateTokens = (user: any) => {
    const accessSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!accessSecret || !refreshSecret) {
        throw new Error("JWT secrets are missing in .env");
    }

    const payload = {
        userId: user._id.toString(),
        email: user.email,
        image: user.image,
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