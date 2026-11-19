
import express from "express";
import { error } from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoute from "./routes/user.route.js";
import ProviderRoute from "./routes/Provider.route.js";
import BookingRoute from "./routes/Booking.route.js";

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

// CORS Configuration
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error(`CORS blocked for origin: ${origin}`)
            );
        },

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);

// ======================================
// STRIPE WEBHOOK RAW BODY
// MUST BE BEFORE express.json()
// ======================================

app.use(
    "/api/v1/booking/webhook",
    express.raw({ type: "application/json" })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Static files
app.use(express.static("public"));

// ======================================
// ROUTES
// ======================================

app.use("/api/v1/users", userRoute);

app.use("/api/v1/provider", ProviderRoute);

app.use("/api/v1/booking", BookingRoute);

// Error handler
app.use(error);

export default app;
