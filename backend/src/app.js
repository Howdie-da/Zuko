import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: [
        process.env.CORS_ORIGIN,
        'capacitor://localhost', 
        'http://localhost'
    ],
    credentials: true
}))

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
    })
);

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