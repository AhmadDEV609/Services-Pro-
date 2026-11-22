
import express from "express";
import { error } from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoute from "./routes/user.route.js";
import ProviderRoute from "./routes/Provider.route.js";
import BookingRoute from "./routes/Booking.route.js";

const app = express();

// CORS Configuration - Allow all origins
const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        callback(null, origin || true);
    },

    credentials: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
        "HEAD",
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "X-Requested-With",
    ],

    optionsSuccessStatus: 204,
};

// Apply CORS globally
app.use(cors(corsOptions));

// Handle preflight requests
app.options(/.*/, cors(corsOptions));

// Stripe webhook raw body
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

// Routes
app.use("/api/v1/users", userRoute);
app.use("/api/v1/provider", ProviderRoute);
app.use("/api/v1/booking", BookingRoute);

// Error handler
app.use(error);

export default app;
