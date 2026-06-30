import { Router } from 'express'
import { getStats } from '../controllers/stats.controller.js'
import { refreshMALToken } from '../middlewares/refreshMALToken.middleware.js'

const userRouter = Router()

userRouter.route("/stats").get(refreshMALToken, getStats)

export {
    userRouter
}