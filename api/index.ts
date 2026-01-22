import dotenv from "dotenv";
import connectDB, { dbInstance } from "../src/db/mongodb";
import app from "../app";


dotenv.config({
    path: "./.env",
});

if (process.env.VERCEL) {
    // Vercel: lazy-connect DB on first request, avoid crashing if env missing
    const shouldSkip = (path: string) => path === "/healthz" || path === "/";
    app.use(async (req, _res, next) => {
        if (shouldSkip(req.path)) return next();
        try {
            if (!dbInstance) {
                await connectDB();
            }
            next();
        } catch (err) {
            next(err);
        }
    });
} else {
    // Local development: start server
    connectDB().then(() => {
        app.listen(process.env.PORT || 8080, () => {
            console.log("Server running on port", process.env.PORT || 8080);
        });
    });
}

export default app;