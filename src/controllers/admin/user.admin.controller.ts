import { type Request, type Response } from "express";
import { Types } from "mongoose";
import { UserRolesEnum } from "../../constants";
import { User } from "../../models/apps/auth/user.model";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

const isValidId = (id: string) => Types.ObjectId.isValid(id);

const listUsersController = asyncHandler(async (_req: Request, res: Response) => {
    const users = await User.find()
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .lean();

    res.status(200).json(new ApiResponse(200, users, "Users fetched"));
});

const updateUserRoleController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body ?? {};

    if (!id || !isValidId(id)) {
        throw new ApiError(400, "Valid user id is required");
    }

    if (!role || !Object.values(UserRolesEnum).includes(role)) {
        throw new ApiError(400, "Invalid role value");
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true })
        .select("-password -refreshToken");
    // console.log("Updated user role:", user);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, user.role, "User role updated"));
});

const blockUserController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { blocked } = req.body ?? {};

    if (!id || !isValidId(id)) {
        throw new ApiError(400, "Valid user id is required");
    }

    if (typeof blocked !== "boolean") {
        throw new ApiError(400, "blocked must be a boolean");
    }

    const user = await User.findByIdAndUpdate(id, { isBlocked: blocked }, { new: true })
        .select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, user.role, blocked ? "User blocked" : "User unblocked"));
});
const unblockedUserController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isBlocked } = req.body ?? {};
    if (!id || !isValidId(id)) {
        throw new ApiError(400, "Valid user id is required");
    }
    if (typeof isBlocked !== "boolean") {
        throw new ApiError(400, "isBlocked must be a boolean");
    }
    const user = await User.findByIdAndUpdate(id, { isBlocked: isBlocked }, { new: true })
        .select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    res.status(200).json(new ApiResponse(200, user.role, "User unblocked"));
});
export { listUsersController, updateUserRoleController, blockUserController, unblockedUserController };
