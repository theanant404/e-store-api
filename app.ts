import express, { type NextFunction, type Request, type Response } from "express";
import { createServer } from "http";
import { rateLimit, ipKeyGenerator, type Options } from "express-rate-limit";
import cookieParser from "cookie-parser";
import helmet from "helmet"; // SECURITY: Added Helmet
import { ApiError } from "./src/utils/ApiError";
const app = express();
const httpServer = createServer(app);

// 1. SECURITY: Add Helmet for secure headers
app.use(helmet());

// 2. CORS/App-Key Guard (Improved)
app.use((req: Request, res: Response, next: NextFunction) => {
    const appKey = req.header("x-app-key");
    const origin = req.header("origin");

    // Whitelist specific origins
    const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000"];
    if (origin && allowedOrigins.includes(origin)) {
        return next();
    }

    // Strict App Key check for non-browser clients (like Mobile Apps)
    if (appKey !== process.env.MOBILE_APP_SECRET) { // Use env variables for secrets
        return res.status(403).json({
            success: false,
            message: "Forbidden: Invalid App Key"
        });
    }

    next();
});

// 3. Rate Limiter (Corrected Types & Handler)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5000,
    standardHeaders: 'draft-8', // Use latest IETF standard headers
    legacyHeaders: false,
    // Use helper to ensure IPv6 is handled correctly
    keyGenerator: (req: Request) => ipKeyGenerator(req),
    handler: (req: Request, res: Response, next: NextFunction, options: Options) => {
        const minutes = options.windowMs / 60000;
        // Pass error to next() instead of throwing inside handler
        next(new ApiError(
            options.statusCode || 429,
            `Too many requests. Allowed ${options.limit} per ${minutes} minute window.`
        ));
    },
});

app.use(limiter);

// 4. Standard Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// 5. Routes
app.get("/", (_req: Request, res: Response) => {
    type User = {
        id: string;
        name: string;
    };
    let user: User = { id: "1", name: "Anant" };
    res.json({ success: true, message: "Welcome to the Home Page", timestamp: new Date().toISOString(), user });
});

app.get("/healthz", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// 6. GLOBAL ERROR HANDLER (Required for ApiError to work)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
    });
});

export { app, httpServer };


