
import type { Request, Response } from "express";
import type { Types } from "mongoose";

import asyncHandler from "../helper/asynHandler.js";
import User from "../models/User.model.js";
import Provider from "../models/Provider.model.js";

type AppRole = "user" | "provider" | "admin";

type AuthenticatedRequest = Request & {
    user?: {
        _id: Types.ObjectId;
        role: AppRole;
    };
};

interface WorkingHour {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
}

const allowedDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

// Create provider profile
const createProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const authReq = req as AuthenticatedRequest;

        const {
            businessName,
            description,
            experience,
            serviceCategory,
            serviceCharges,
            address,
            city,
            state,
            country,
            postalCode,
            workingHours,
        } = req.body;

        if (
            !businessName?.trim() ||
            !description?.trim() ||
            experience === undefined ||
            experience === "" ||
            !serviceCategory?.trim() ||
            serviceCharges === undefined ||
            serviceCharges === "" ||
            !address?.trim() ||
            !city?.trim() ||
            !Array.isArray(workingHours)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required profile information",
            });
        }

        const numericExperience = Number(experience);
        const numericCharges = Number(serviceCharges);

        if (
            !Number.isFinite(numericExperience) ||
            numericExperience < 0 ||
            !Number.isFinite(numericCharges) ||
            numericCharges < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Experience and service charges must be valid non-negative numbers",
            });
        }

        if (description.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: "Description must contain at least 20 characters",
            });
        }

        // Validate all seven days
        if (
            workingHours.length !== 7 ||
            !allowedDays.every((day) =>
                workingHours.some(
                    (hour: WorkingHour) => hour.day === day
                )
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide working hours for all seven days",
            });
        }

        const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;

        const validHours = workingHours.every(
            (hour: WorkingHour) => {
                if (
                    !allowedDays.includes(hour.day) ||
                    typeof hour.open !== "string" ||
                    typeof hour.close !== "string" ||
                    typeof hour.isClosed !== "boolean"
                ) {
                    return false;
                }

                if (hour.isClosed) return true;

                return (
                    validTime.test(hour.open) &&
                    validTime.test(hour.close) &&
                    hour.open < hour.close
                );
            }
        );

        if (!validHours) {
            return res.status(400).json({
                success: false,
                message: "Invalid working hours",
            });
        }

        // Authentication
        const userId = authReq.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please log in first",
            });
        }

        const user = await User.findById(userId).select("_id role");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.role !== "provider") {
            return res.status(403).json({
                success: false,
                message: "Only provider accounts can create provider profiles",
            });
        }

        const existingProfile = await Provider.findOne({
            providerInfo: userId,
        });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "You have already created a provider profile",
            });
        }

        const provider = await Provider.create({
            providerInfo: userId,
            businessName: businessName.trim(),
            description: description.trim(),
            experience: numericExperience,
            serviceCategory: serviceCategory.trim(),
            serviceCharges: numericCharges,

            businessLocation: {
                address: address.trim(),
                city: city.trim(),
                state: state?.trim() ?? "",
                country: country?.trim() ?? "",
                postalCode: postalCode?.trim() ?? "",
            },

            workingHours,
            approvalStatus: "pending",
        });

        return res.status(201).json({
            success: true,
            message:
                "Provider profile submitted successfully. Waiting for admin approval.",
            provider,
        });
    }
);

// Get logged-in provider profile
const getspecificProvider = asyncHandler(
    async (req: Request, res: Response) => {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please log in first",
            });
        }

        const provider = await Provider.findOne({
            providerInfo: userId,
        }).populate("providerInfo", "name email image");

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            provider,
        });
    }
);

// Get approved providers with filters and pagination
const filters = asyncHandler(
    async (req: Request, res: Response) => {
        const page = Math.max(1, Number(req.query.page) || 1);

        const limit = Math.min(
            50,
            Math.max(1, Number(req.query.limit) || 10)
        );

        const search =
            typeof req.query.search === "string"
                ? req.query.search.trim()
                : "";

        const category =
            typeof req.query.category === "string"
                ? req.query.category.trim()
                : "";

        const filter: Record<string, unknown> = {
            approvalStatus: "approved",
        };

        if (search) {
            filter.businessName = {
                $regex: search,
                $options: "i",
            };
        }

        if (category) {
            filter.serviceCategory = {
                $regex: category,
                $options: "i",
            };
        }

        const providers = await Provider.paginate(filter, {
            page,
            limit,
            sort: { createdAt: -1 },
            populate: {
                path: "providerInfo",
                select: "name email image",
            },
        });

        return res.status(200).json({
            success: true,
            message: "Approved providers fetched successfully",
            providers: providers.docs,
            total: providers.totalDocs,
            totalPages: providers.totalPages,
            currentPage: providers.page,
            hasNextPage: providers.hasNextPage,
            hasPrevPage: providers.hasPrevPage,
        });
    }
);

// ADMIN: Get all provider requests
const getAllProvider = asyncHandler(
    async (req: Request, res: Response) => {
        const providers = await Provider.find()
            .populate("providerInfo", "name email image role")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: "Provider requests fetched successfully",
            providers,
        });
    }
);

// ADMIN: Approve or reject provider
const updateProviderStatus = asyncHandler(
    async (req: Request, res: Response) => {
        const { providerId } = req.params;
        const { approvalStatus, rejectionReason } = req.body;

        if (!["approved", "rejected"].includes(approvalStatus)) {
            return res.status(400).json({
                success: false,
                message: "Status must be approved or rejected",
            });
        }

        if (
            approvalStatus === "rejected" &&
            (typeof rejectionReason !== "string" ||
                !rejectionReason.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required",
            });
        }

        const provider = await Provider.findByIdAndUpdate(
            providerId,
            {
                $set: {
                    approvalStatus,
                    rejectionReason:
                        approvalStatus === "rejected"
                            ? rejectionReason.trim()
                            : "",
                },
            },
            {
                new: true,
                runValidators: true,
            }
        ).populate("providerInfo", "name email image role");

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Provider ${approvalStatus} successfully`,
            provider,
        });
    }
);

// PUBLIC: Get only approved providers
const getApprovedProviders = asyncHandler(
    async (req: Request, res: Response) => {
        const providers = await Provider.find({
            approvalStatus: "approved",
        })
            .populate("providerInfo", "name email image")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: "Approved providers fetched successfully",
            providers,
        });
    }
);

export {
    createProfile,
    getspecificProvider,
    filters,
    getAllProvider,
    updateProviderStatus,
    getApprovedProviders,
};
