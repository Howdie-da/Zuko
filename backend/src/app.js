import express from "express";
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: [`${process.env.CORS_ORIGIN}`, 'http://localhost:2004', 'capacitor://localhost'],
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(cookieParser())


import { authRouter } from "./routes/auth.routes.js";
import { animeRouter } from "./routes/anime.routes.js";
import { userRouter } from "./routes/user.routes.js";

app.use("/api/auth", authRouter)
app.use("/api/anime", animeRouter)
app.use("/api/user", userRouter)

export {
    app
} 