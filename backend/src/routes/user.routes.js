import { Router } from 'express'
import { getStats } from '../controllers/stats.controller.js'

const userRouter = Router()

userRouter.route("/stats").get(getStats)

export {
    userRouter
}