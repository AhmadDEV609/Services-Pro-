
import { Schema, model, Types } from "mongoose";

export interface BookingData {
    provider: Types.ObjectId;
    user: Types.ObjectId;
    date: Date;
    day: string;
    BookingStatus: "pending" | "approved" | "rejected";
    paymentMethod: "cash" | "online";
    paymentStatus: "pending" | "completed";
}

const bookingSchema = new Schema<BookingData>(
    {
        provider: {
            type: Schema.Types.ObjectId,
            ref: "Provider",
            required: true,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        date: {
            type: Date,
            required: true,
        },

        day: {
            type: String,
            enum: [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ],
            required: true,
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "online"],
            default: "cash",
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
            required: true,
        },

        BookingStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Same customer cannot book the same provider twice on the same date.
// Different customers can book the same provider on the same date.
bookingSchema.index(
    {
        user: 1,
        provider: 1,
        date: 1,
    },
    {
        unique: true,
    }
);

const Booking = model<BookingData>("Booking", bookingSchema);

export default Booking;
