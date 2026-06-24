import express from "express";
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS
}))

app.use(express.json({limit: "16kb"}))
app.use(cookieParser())


import authRouter from "./routes/auth.routes.js";

app.use("/api/auth", authRouter)

export {
    app
} 