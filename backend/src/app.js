import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use((req, res, next) => {
    const origin = req.headers.origin;
    res.header("Access-Control-Allow-Origin", origin || "*"); 
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

// 3. Routes
import { authRouter } from "./routes/auth.routes.js";
import { animeRouter } from "./routes/anime.routes.js";
import { userRouter } from "./routes/user.routes.js";

app.use("/api/auth", authRouter);
app.use("/api/anime", animeRouter);
app.use("/api/user", userRouter);

export { app };