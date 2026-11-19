import type { Request, Response } from "express";
import type { Types } from "mongoose";
import User from "../models/User.model.js";
import asyncHandler from "../helper/asynHandler.js";
import Provider from "../models/Provider.model.js";


type AppRole = "user" | "provider" | "admin";

type AuthenticatedRequest = Request & {
    user?: {
        _id: Types.ObjectId;
        role: AppRole;
    };
};

const getProvider = asyncHandler(async (req: Request, res: Response) => {
    const getData = await Provider.find();
    if (!getData) {
        return res.status(404).json({
            success: false,
            message: "Provider not found",
        });
    }
    res.status(200).json(getData);
})


const updateProviderStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const { status } = req.body;
    const getData = await Provider.findById(id);
    if (!getData) {
        return res.status(404).json({
            success: false,
            message: "Provider not found",
        });
    }
    const updatedProvider = await Provider.findByIdAndUpdate(
        id,
        { verificationStatus: status },
        { new: true }
    );
    res.status(200).json(
        updatedProvider
    )
})

const getAllUser = asyncHandler(async (req: Request, res: Response) => {
    const getData = await User.find();
    if (!getData) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
    res.status(200).json(getData);
})

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const getData = await User.findByIdAndDelete(id);
    if (!getData) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
    res.status(200).json(getData);
});


const getApproveProvider = asyncHandler(async (req: Request, res: Response) => {
    const getData = await Provider.find({ approvalStatus: "approved" });
    if (!getData) {
        return res.status(404).json({
            success: false,
            message: "Provider not found",
        });
    }
    res.status(200).json(getData);
})




export { getProvider, updateProviderStatus, getAllUser, deleteUser, getApproveProvider };


