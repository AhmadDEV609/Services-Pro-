
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Stripe from "stripe";

import asyncHandler from "../helper/asynHandler.js";
import Booking from "../models/Booking.model.js";
import Provider from "../models/Provider.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

type AuthenticatedRequest = Request & {
    user?: {
        _id: mongoose.Types.ObjectId;
        role: "user" | "provider" | "admin";
    };
};

const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];


const validateBookingDetails = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    const rawProviderId = req.params.id;

    const providerId =
        typeof rawProviderId === "string"
            ? rawProviderId
            : Array.isArray(rawProviderId)
                ? rawProviderId[0]
                : undefined;


    if (!userId || userRole !== "user") {
        res.status(403).json({
            success: false,
            message: "Only customers can create bookings.",
        });
        return null;
    }


    if (
        typeof providerId !== "string" ||
        !mongoose.Types.ObjectId.isValid(providerId)
    ) {
        res.status(400).json({
            success: false,
            message: "Invalid provider ID.",
        });
        return null;
    }

    const providerObjectId = new mongoose.Types.ObjectId(providerId);

    const { date, day } = req.body;

    if (!date || typeof date !== "string") {
        res.status(400).json({
            success: false,
            message: "Booking date is required.",
        });
        return null;
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        res.status(400).json({
            success: false,
            message: "Invalid booking date.",
        });
        return null;
    }

    // Normalize selected date to UTC midnight
    const appointmentDate = new Date(
        Date.UTC(
            parsedDate.getUTCFullYear(),
            parsedDate.getUTCMonth(),
            parsedDate.getUTCDate()
        )
    );


    const today = new Date();

    const todayDate = new Date(
        Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate()
        )
    );


    if (appointmentDate < todayDate) {
        res.status(400).json({
            success: false,
            message: "You cannot book a date in the past.",
        });
        return null;
    }


    const dayName = weekdayNames[appointmentDate.getUTCDay()] ?? "";


    if (
        day !== undefined &&
        (
            typeof day !== "string" ||
            day.toLowerCase() !== dayName.toLowerCase()
        )
    ) {
        res.status(400).json({
            success: false,
            message: "Selected day does not match the booking date.",
        });
        return null;
    }


    const provider = await Provider.findById(providerObjectId);

    if (!provider) {
        res.status(404).json({
            success: false,
            message: "Provider not found.",
        });
        return null;
    }


    if (provider.approvalStatus !== "approved") {
        res.status(400).json({
            success: false,
            message: "This provider is not approved yet.",
        });
        return null;
    }

    const workingDay = provider.workingHours.find(
        (item) =>
            item.day.toLowerCase() === dayName.toLowerCase()
    );

    if (!workingDay || workingDay.isClosed) {
        res.status(400).json({
            success: false,
            message: `Provider is not available on ${dayName}.`,
        });
        return null;
    }

    return {
        userId,
        provider,
        providerObjectId,
        appointmentDate,
        dayName,
        workingDay,
    };
};


export const createBooking = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const bookingDetails = await validateBookingDetails(req, res);

        if (!bookingDetails) return;

        const {
            userId,
            providerObjectId,
            appointmentDate,
            dayName,
            workingDay,
        } = bookingDetails;


        const existingBooking = await Booking.findOne({
            user: userId,
            provider: providerObjectId,
            date: appointmentDate,
        });

        if (existingBooking) {
            res.status(409).json({
                success: false,
                message:
                    "You have already booked this provider for this date.",
            });
            return;
        }

        try {
            const booking = await Booking.create({
                user: userId,
                provider: providerObjectId,
                date: appointmentDate,
                day: dayName,
                paymentMethod: "cash",
                paymentStatus: "pending",
                BookingStatus: "pending",
            });

            res.status(201).json({
                success: true,
                message: "Cash booking request created successfully.",
                booking,
                workingHours: {
                    open: workingDay.open,
                    close: workingDay.close,
                },
            });
        } catch (error: unknown) {
            if (
                error instanceof mongoose.mongo.MongoServerError &&
                error.code === 11000
            ) {
                res.status(409).json({
                    success: false,
                    message:
                        "You have already booked this provider for this date.",
                });
                return;
            }

            throw error;
        }
    }
);

// Create online booking
export const onlinePayment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const bookingDetails = await validateBookingDetails(req, res);

        if (!bookingDetails) return;

        const {
            userId,
            provider,
            providerObjectId,
            appointmentDate,
            dayName,
            workingDay,
        } = bookingDetails;

        // Check duplicate booking
        const existingBooking = await Booking.findOne({
            user: userId,
            provider: providerObjectId,
            date: appointmentDate,
        });

        if (existingBooking) {
            res.status(409).json({
                success: false,
                message:
                    "You have already booked this provider for this date.",
            });
            return;
        }


        const serviceFee = provider.serviceCharges;

        if (!Number.isFinite(serviceFee) || serviceFee <= 0) {
            res.status(400).json({
                success: false,
                message: "Provider has an invalid service price.",
            });
            return;
        }

        const clientUrl = process.env.FRONTEND_URL;

        if (!clientUrl) {
            res.status(500).json({
                success: false,
                message: "CLIENT_URL is not configured.",
            });
            return;
        }

        let createdBookingId: string | null = null;

        try {

            const booking = await Booking.create({
                user: userId,
                provider: providerObjectId,
                date: appointmentDate,
                day: dayName,
                paymentMethod: "online",
                paymentStatus: "pending",
                BookingStatus: "pending",
            });

            createdBookingId = booking._id.toString();


            const session = await stripe.checkout.sessions.create({
                mode: "payment",

                metadata: {
                    bookingId: createdBookingId,
                    userId: userId.toString(),
                    providerId: providerObjectId.toString(),
                    date: appointmentDate.toISOString(),
                    day: dayName,
                },

                line_items: [
                    {
                        price_data: {
                            currency: "usd",
                            product_data: {
                                name: provider.businessName,
                                description: "ServicePro booking",
                            },
                            unit_amount: Math.round(serviceFee * 100),
                        },
                        quantity: 1,
                    },
                ],

                success_url:
                    `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,

                cancel_url: `${clientUrl}/cancel`,
            });

            if (!session.url) {
                throw new Error(
                    "Unable to create Stripe checkout URL."
                );
            }

            res.status(200).json({
                success: true,
                message: "Stripe checkout session created successfully.",
                url: session.url,
                sessionId: session.id,
                bookingId: createdBookingId,
                workingHours: {
                    open: workingDay.open,
                    close: workingDay.close,
                },
            });
        } catch (error) {

            if (createdBookingId) {
                await Booking.findByIdAndDelete(createdBookingId);
            }

            throw error;
        }
    }
);




export const getCustomerBookings = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.user?._id;
        const userRole = req.user?.role;


        if (!userId || userRole !== "user") {
            res.status(403).json({
                success: false,
                message: "Only customers can view their bookings.",
            });
            return;
        }


        const bookings = await Booking.find({
            user: userId,
        })
            .populate({
                path: "provider",
                select:
                    "businessName serviceCategory serviceCharges businessLocation providerInfo",
                populate: {
                    path: "providerInfo",
                    select: "name image email",
                },
            })
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            message: "Your bookings fetched successfully.",
            totalBookings: bookings.length,
            bookings,
        });
    }
);


// Get bookings received by logged-in provider
export const getProviderBookings = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.user?._id;
        const userRole = req.user?.role;

        if (!userId || userRole !== "provider") {
            res.status(403).json({
                success: false,
                message: "Only providers can view their bookings.",
            });
            return;
        }


        const provider = await Provider.findOne({
            providerInfo: userId,
        });

        if (!provider) {
            res.status(404).json({
                success: false,
                message: "Provider profile not found.",
            });
            return;
        }

        const bookings = await Booking.find({
            provider: provider._id,
        })
            .populate({
                path: "user",
                select: "name email image",
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Provider bookings fetched successfully.",
            totalBookings: bookings.length,
            bookings,
        });
    }
);



export const updateBookingStatus = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.user?._id;
        const userRole = req.user?.role;

        if (!userId || userRole !== "provider") {
            res.status(403).json({
                success: false,
                message: "Only providers can update booking status.",
            });
            return;
        }

        const rawBookingId = req.params.id;

        const bookingId =
            typeof rawBookingId === "string"
                ? rawBookingId
                : Array.isArray(rawBookingId)
                    ? rawBookingId[0]
                    : undefined;

        if (
            !bookingId ||
            !mongoose.Types.ObjectId.isValid(bookingId)
        ) {
            res.status(400).json({
                success: false,
                message: "Invalid booking ID.",
            });
            return;
        }

        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            res.status(400).json({
                success: false,
                message: "Status must be approved or rejected.",
            });
            return;
        }


        const provider = await Provider.findOne({
            providerInfo: userId,
        });

        if (!provider) {
            res.status(404).json({
                success: false,
                message: "Provider profile not found.",
            });
            return;
        }


        const booking = await Booking.findOne({
            _id: bookingId,
            provider: provider._id,
        });

        if (!booking) {
            res.status(404).json({
                success: false,
                message: "Booking not found for this provider.",
            });
            return;
        }


        if (booking.BookingStatus !== "pending") {
            res.status(400).json({
                success: false,
                message: "This booking has already been processed.",
            });
            return;
        }

        booking.BookingStatus = status;
        await booking.save();

        res.status(200).json({
            success: true,
            message: `Booking ${status} successfully.`,
            booking,
        });
    }
);