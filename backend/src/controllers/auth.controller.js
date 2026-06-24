import crypto from "crypto";
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import axios from 'axios'

const options = {
    httpOnly: true,
    secure: false
}

const login = asyncHandler(async (req, res) => {
    const verifier = crypto.randomBytes(48).toString('base64url')

    res.cookie("code_verifier", verifier, options)

    const malAuthUrl = `https://myanimelist.net/v1/oauth2/authorize?` +
                       `response_type=code` +
                       `&client_id=${process.env.MAL_CLIENT_ID}` +
                       `&redirect_uri=${encodeURIComponent(process.env.MAL_REDIRECT_URI)}` +
                       `&code_challenge=${verifier}` +
                       `&code_challenge_method=plain`
    
    res.redirect(malAuthUrl)
})

const callback = asyncHandler(async (req, res) => {
    const code = req.query?.code
    const verifier = req.cookies?.code_verifier

    if (!code) {
        throw new ApiError(400, "Authentication rejected by user")
    }

    const tokenPayload = {
        client_id: process.env.MAL_CLIENT_ID,
        client_secret: process.env.MAL_SECRET,
        code,
        code_verifier: verifier,
        grant_type: "authorization_code",
        redirect_uri: process.env.MAL_REDIRECT_URI
    }

    const response = await axios.post(
        "https://myanimelist.net/v1/oauth2/token",
        new URLSearchParams(tokenPayload),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    )

    const {access_token, refresh_token} = response.data

    return res
    .cookie("access_token", access_token, cookieOptions)
    .cookie("refresh_token", refresh_token, cookieOptions)
    .json(response.data)
})

export {
    login,
    callback
}