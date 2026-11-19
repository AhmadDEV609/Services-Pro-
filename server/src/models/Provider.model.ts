
import { Schema, model, Types } from "mongoose";
import type { PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

interface IWorkingHour {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
}

export interface IProvider {
    providerInfo: Types.ObjectId;

    businessName: string;
    description: string;
    experience: number;
    serviceCategory: string;
    serviceCharges: number;

    businessLocation: {
        address: string;
        city: string;
        state?: string;
        country?: string;
        postalCode?: string;
    };

    workingHours: IWorkingHour[];

    approvalStatus: "pending" | "approved" | "rejected";
    rejectionReason?: string;
}

const providerSchema = new Schema<IProvider>(
    {
        providerInfo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        businessName: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        experience: {
            type: Number,
            required: true,
            min: 0,
        },

        serviceCategory: {
            type: String,
            required: true,
            trim: true,
        },

        serviceCharges: {
            type: Number,
            required: true,
            min: 0,
        },

        businessLocation: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, default: "" },
            country: { type: String, default: "" },
            postalCode: { type: String, default: "" },
        },

        workingHours: [
            {
                day: {
                    type: String,
                    required: true,
                    enum: [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                    ],
                },

                open: {
                    type: String,
                    required: true,
                },

                close: {
                    type: String,
                    required: true,
                },

                isClosed: {
                    type: Boolean,
                    default: false,
                },
            },
        ],

        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        rejectionReason: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

providerSchema.plugin(paginate);

const Provider = model<IProvider, PaginateModel<IProvider>>(
    "Provider",
    providerSchema
);

export default Provider;
