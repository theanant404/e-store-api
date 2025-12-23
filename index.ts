import { httpServer } from "./app";



const port = process.env.PORT || 8080;

const startServer = () => {
    httpServer.listen(process.env.PORT || 8080, () => {
        console.info(
            `📑 Visit the documentation at: http://localhost:${process.env.PORT || 8080
            }`
        );
        console.log("⚙️  Server is running on port: " + port);
    });
};

startServer();