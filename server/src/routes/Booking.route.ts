
import express from "express";
import Stripe from "stripe";

import {
    createBooking,
    onlinePayment,
    getCustomerBookings,
    getProviderBookings,
    updateBookingStatus,
} from "../controller/Booking.controller.js";
import auth from "../middleware/auth.middleware.js";

import asyncHandler from "../helper/asynHandler.js";
import Booking from "../models/Booking.model.js";
import type { Request, Response } from "express";
import mongoose from "mongoose";
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Stripe webhook
router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    asyncHandler(async (req: Request, res: Response) => {
        const signature = req.headers["stripe-signature"];

        if (!signature || typeof signature !== "string") {
            res.status(400).json({
                success: false,
                message: "Missing Stripe signature.",
            });
            return;
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            res.status(500).json({
                success: false,
                message: "Stripe webhook secret is not configured.",
            });
            return;
        }

        let event: Stripe.Event;

        // Verify Stripe webhook signature
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                webhookSecret
            );
        } catch {
            res.status(400).json({
                success: false,
                message: "Invalid Stripe webhook signature.",
            });
            return;
        }

        // Handle successful checkout
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            if (session.payment_status === "paid") {
                const bookingId = session.metadata?.bookingId;

                if (!bookingId) {
                    res.status(400).json({
                        success: false,
                        message: "Booking ID missing from Stripe metadata.",
                    });
                    return;
                }

                if (!mongoose.Types.ObjectId.isValid(bookingId)) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid booking ID.",
                    });
                    return;
                }

                const booking = await Booking.findById(bookingId);

                if (!booking) {
                    res.status(404).json({
                        success: false,
                        message: "Booking not found.",
                    });
                    return;
                }

                // Only update online bookings
                if (booking.paymentMethod !== "online") {
                    res.status(200).json({
                        success: true,
                        message: "This is not an online booking.",
                    });
                    return;
                }

                // Avoid processing an already completed payment
                if (booking.paymentStatus !== "completed") {
                    booking.paymentStatus = "completed";
                    await booking.save();
                }
            }
        }

        res.status(200).json({
            success: true,
            message: "Webhook received successfully.",
        });
    })
);

// Get logged-in customer's bookings
router.get("/my-bookings", auth, getCustomerBookings);

// Create cash booking
router.post("/:id", auth, createBooking);

// Create online booking
router.post("/online/:id", auth, onlinePayment);

// Customer routes
router.get("/my-bookings", auth, getCustomerBookings);
router.post("/:id", auth, createBooking);
router.post("/online/:id", auth, onlinePayment);

// Provider routes
router.get("/provider-bookings", auth, getProviderBookings);
router.patch("/:id/status", auth, updateBookingStatus);

export default router;
