import express from "express";

const app = express();


// Middleware
app.use(express.json());

// Basic Route
app.get("/", (req, res) => {
    res.json({ message: "Hello from Bun + Express!" });
});


export { app }
