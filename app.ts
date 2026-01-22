import express, { type NextFunction, type Request, type Response } from "express";
import { createServer } from "http";
import { rateLimit, ipKeyGenerator, type Options } from "express-rate-limit";
import cookieParser from "cookie-parser";
import helmet from "helmet"; // SECURITY: Added Helmet
import { ApiError } from "./src/utils/ApiError";
import authRouter from "./src/routes/auth.route";
import uploadsRouter from "./src/routes/uploads.route";
import categoryRouter from "./src/routes/category.route";
import productRouter from "./src/routes/product.route";
import varietyRouter from "./src/routes/variety.route";
import adminRouter from "./src/routes/admin.route";
import userRouter from "./src/routes/user.route";
import deliveryRouter from "./src/routes/delivery.route";
const app = express();
const httpServer = createServer(app);

// 1. SECURITY: Add Helmet for secure headers
app.use(helmet());
// cors origin allow origin 
// 2. CORS/App-Key Guard (Improved)
app.use((req: Request, res: Response, next: NextFunction) => {
    const appKey = req.header("x-app-key");
    const origin = req.header("origin");

    // Whitelist specific origins
    const allowedOrigins = ["*"];
    if (origin && allowedOrigins.includes(origin)) {
        return next();
    }

    // Strict App Key check for non-browser clients (like Mobile Apps)
    // if (appKey !== process.env.MOBILE_APP_SECRET) { // Use env variables for secrets
    //     return res.status(403).json({
    //         success: false,
    //         message: "Forbidden: Invalid App Key"
    //     });
    // }

    next();
});

// 3. Rate Limiter (Corrected Types & Handler)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5000,
    standardHeaders: 'draft-8', // Use latest IETF standard headers
    legacyHeaders: false,
    // Use helper to ensure IPv6 is handled correctly; ipKeyGenerator expects an IP string
    keyGenerator: (req: Request) => ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? ""),
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
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/uploads", uploadsRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/products/:productId/varieties", varietyRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/delivery", deliveryRouter); // added to test admin user controller
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
export default app;


