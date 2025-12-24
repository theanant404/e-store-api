import { type NextFunction, type Request, type Response } from "express";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown;

// Wrap async route handlers to forward errors to Express error middleware
const asyncHandler = (handler: AsyncRequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(handler(req, res, next)).catch((err) => next(err));
    };
};

export { asyncHandler, type AsyncRequestHandler };