import { Router } from 'express'
import { login, callback, getProfile } from '../controllers/auth.controller.js'

const router = Router()

router.route("/login").get(login)

router.route("/callback").get(callback)

router.route("/me").get(getProfile);

export default router