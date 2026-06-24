import { Router } from 'express'
import { login, callback, getProfile } from '../controllers/auth.controller.js'

const authRouter = Router()

authRouter.route("/login").get(login)

authRouter.route("/callback").get(callback)

authRouter.route("/me").get(getProfile);

export {
    authRouter
}