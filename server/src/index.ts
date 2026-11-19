import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./db/connection.js";

const port = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

startServer();