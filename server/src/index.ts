import app from "../src/app.js";
import { connectDB } from "../src/db/connection.js";

export default async function handler(req: any, res: any) {
    try {
        await connectDB();
        return app(req, res);
    } catch (err) {
        console.error("Database connection error:", err);

        return res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
}