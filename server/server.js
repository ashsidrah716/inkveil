import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import router from "./routes/pages.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/pages", router);

// used to check if routes where working at all
// app.get("/", (req, res) => {
//     res.send("Server is working");
// });

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("MongoDB connection failed", error);
    }
}

startServer();