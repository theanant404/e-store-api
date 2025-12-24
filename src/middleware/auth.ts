import { type NextFunction, type Request, type Response } from "express";
import { verifyAccessToken } from "../lib/jwt";
import { ApiError } from "../utils/ApiError";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : undefined;
    const token = req.cookies?.accessToken || bearer;

    if (!token) {
        return next(new ApiError(401, "Unauthorized"));
    }

    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        return next();
    } catch (err) {
        return next(new ApiError(401, "Invalid or expired token"));
    }
};
