import crypto from "crypto";
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from "../utils/asyncHandler.js"
import axios from 'axios'
import { User } from '../models/user.model.js'

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
        return res.redirect(process.env.HOME_PAGE)
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

    const profileResponse = await axios.get(
        "http://api.myanimelist.net/v2/users/@me",
        {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        }
    )

    const profile = profileResponse.data

    const user = await User.findOneAndUpdate(
        { malId: profile.id },
        {
            username: profile.name,
            avatar: profile.picture,
            accessToken: access_token,
            refreshToken: refresh_token
        },
        {
            returnDocument: "after",
            upsert: true
        }
    )

    return res
    .cookie("access_token", access_token, options)
    .cookie("refresh_token", refresh_token, options)
    .cookie("user_id", user.malId, options)
    .redirect(process.env.HOME_PAGE)
})

const getProfile = asyncHandler(async (req, res) => {
    const accessToken = req.cookies?.access_token

    if (!accessToken) {
        throw new ApiError(401, "User is not authenticated")
    }

    const response = await axios.get(
        "https://api.myanimelist.net/v2/users/@me",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, response.data, "User profile fetched Successfully"))
})

export {
    login,
    callback,
    getProfile
}