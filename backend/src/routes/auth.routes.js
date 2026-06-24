import { Router } from 'express'
import { login, callback } from '../controllers/auth.controller.js'

const router = Router()

router.route("/login").get(login)

router.route("/callback").get(callback)

export default router