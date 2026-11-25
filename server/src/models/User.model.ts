
import {
    Schema,
    model,
    Types,
} from "mongoose";

// USER ROLES
export type UserRole =
    | "user"
    | "provider"
    | "admin";

// USER INTERFACE
export interface IUser {
    _id: Types.ObjectId;

    name: string;

    age?: number;

    email: string;

    password: string;

    image: string;

    public_id?: string;

    role: UserRole;

    refreshtoken?: string;
}

// USER SCHEMA
const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        age: {
            type: Number,
            min: 18,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        image: {
            type: String,
            default: "",
        },

        public_id: {
            type: String,
        },

        refreshtoken: {
            type: String,
            select: false,
        },

        role: {
            type: String,
            enum: [
                "user",
                "provider",
                "admin",
            ],
            required: true,
            default: "user",
        },
    },
    {
        timestamps: true,
    }
);

// CREATE MODEL
const User = model<IUser>(
    "User",
    userSchema
);

export default User;
