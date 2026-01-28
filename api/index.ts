import dotenv from "dotenv";
import connectDB, { dbInstance } from "../src/db/mongodb";
import app from "../app";

dotenv.config({
    path: "./.env",
});

let dbConnected = false;

const ensureDBConnection = async () => {
    if (!dbConnected && !dbInstance) {
        try {
            await connectDB();
            dbConnected = true;
        } catch (err) {
            console.error("Database connection error:", err);
            throw err;
        }
    }
};

// For Vercel: Connect DB before handling requests
app.use(async (req, _res, next) => {
    const shouldSkip = (path: string) => path === "/healthz" || path === "/";

    if (shouldSkip(req.path)) {
        return next();
    }

    try {
        await ensureDBConnection();
        next();
    } catch (err) {
        next(err);
    }
});

export default app;