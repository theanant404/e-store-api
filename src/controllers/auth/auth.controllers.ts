import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import {
    register,
    verifyEmailOtp,
    resendEmailOtp,
    login,
} from "../../services/auth.service";

export const registerController = asyncHandler(async (req: Request, res: Response) => {
    const result = await register(req.body);
    res.status(result.statusCode).json(result);
});

export const verifyEmailController = asyncHandler(async (req: Request, res: Response) => {
    const result = await verifyEmailOtp(req.body);
    res.status(result.statusCode).json(result);
});

export const resendEmailOtpController = asyncHandler(async (req: Request, res: Response) => {
    const result = await resendEmailOtp(req.body);
    res.status(result.statusCode).json(result);
});

export const loginController = asyncHandler(async (req: Request, res: Response) => {
    console.log(" Login controller called", req.body);
    const result = await login(req.body);

    const { accessToken, refreshToken } = result.data as any;
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
    };

    res
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .status(result.statusCode)
        .json(result);
});

export const meController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }
    res.status(200).json(new ApiResponse(200, { user: req.user }, "Current user"));
});


