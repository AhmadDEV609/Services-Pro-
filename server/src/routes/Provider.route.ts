
import { Router } from "express";

import auth from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/auth.middleware.js";
import {
    createProfile,
    getspecificProvider,
    filters,
    getAllProvider,
    updateProviderStatus,
    getApprovedProviders,
} from "../controller/Provider.controller.js";

const ProviderRoute = Router();

// Provider creates profile
ProviderRoute.post("/", auth, createProfile);

// Logged-in provider gets own profile
ProviderRoute.get("/", auth, getspecificProvider);

// Public: Only approved providers with filters
ProviderRoute.get("/filter", filters);

// Public: Get all approved providers
ProviderRoute.get("/approved", getApprovedProviders);

// Admin: Get all provider requests
ProviderRoute.get("/all", adminOnly, getAllProvider);

// Admin: Approve or reject provider
ProviderRoute.patch(
    "/status/:providerId",
    adminOnly,
    updateProviderStatus
);

export default ProviderRoute;
