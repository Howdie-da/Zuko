import { Router } from 'express'
import { login, callback, getProfile } from '../controllers/auth.controller.js'
import { refreshMALToken } from '../middlewares/refreshMALToken.middleware.js'

const authRouter = Router()

authRouter.route("/login").get(login)

authRouter.route("/callback").get(callback)

authRouter.route("/me").get(refreshMALToken, getProfile);

export {
    authRouter
}