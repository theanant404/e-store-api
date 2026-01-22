import dotenv from "dotenv";
import connectDB from "../src/db/mongodb";
import app from "../app";


dotenv.config({
    path: "./.env",
});

if (process.env.VERCEL) {
    // On Vercel, just connect to DB (no listen)
    connectDB();
} else {
    // Local development: start server
    connectDB().then(() => {
        app.listen(process.env.PORT || 8080, () => {
            console.log("Server running on port", process.env.PORT || 8080);
        });
    });
}

export default app;