
import type { ErrorRequestHandler } from "express";

const error: ErrorRequestHandler = (err, req, res, next) => {
    console.error("Error:", err.message);

    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        success: false,
    });
};

export { error };
