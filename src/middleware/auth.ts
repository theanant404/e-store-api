import { type NextFunction, type Request, type Response } from "express";
import { verifyAccessToken } from "../lib/jwt";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";
import { UserRolesEnum } from "../constants";
import { User } from "../models/apps/auth/user.model";

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : undefined;
    const token = req.cookies?.accessToken || bearer;

    if (!token) {
        throw new ApiError(401, "Unauthorized");
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload._id).lean();

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    if (user.isBlocked) {
        throw new ApiError(403, "User is blocked");
    }

    req.user = { ...payload, role: user.role, isBlocked: user.isBlocked };
    next();
});

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new ApiError(401, "Unauthorized"));
    }

    if (req.user.role !== UserRolesEnum.ADMIN) {
        return next(new ApiError(403, "Admin access only"));
    }

    return next();
};
