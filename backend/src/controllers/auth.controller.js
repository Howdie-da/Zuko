import crypto from "crypto";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from 'axios';
import { User } from '../models/user.model.js';

const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000
};

const login = asyncHandler(async (req, res) => {
    const returnTo = req.query.returnTo || '/';
    const verifier = crypto.randomBytes(48).toString('base64url');

    res.cookie("code_verifier", verifier, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 15
    });

    const malAuthUrl = `https://myanimelist.net/v1/oauth2/authorize?` +
                       `response_type=code` +
                       `&client_id=${process.env.MAL_CLIENT_ID}` +
                       `&redirect_uri=${encodeURIComponent(process.env.MAL_REDIRECT_URI)}` +
                       `&code_challenge=${verifier}` +
                       `&code_challenge_method=plain` +
                       `&state=${encodeURIComponent(returnTo)}`;
    
    res.redirect(malAuthUrl);
});

const callback = asyncHandler(async (req, res) => {
    const code = req.query?.code;
    const verifier = req.cookies?.code_verifier;
    
    const returnToPath = req.query?.state || '/';
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://zuko-list.vercel.app';

    res.clearCookie('code_verifier');

    if (!code || !verifier) {
        const errorUrl = returnToPath.startsWith('zuko://') 
            ? `${returnToPath}?error=auth_failed` 
            : `${frontendUrl}/?error=auth_failed`;
        return res.redirect(errorUrl);
    }

    const tokenPayload = {
        client_id: process.env.MAL_CLIENT_ID,
        client_secret: process.env.MAL_SECRET,
        code,
        code_verifier: verifier,
        grant_type: "authorization_code",
        redirect_uri: process.env.MAL_REDIRECT_URI
    };

    const response = await axios.post(
        "https://myanimelist.net/v1/oauth2/token",
        new URLSearchParams(tokenPayload),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token } = response.data;

    const profileResponse = await axios.get(
        "https://api.myanimelist.net/v2/users/@me",
        { headers: { "Authorization": `Bearer ${access_token}` } }
    );

    const profile = profileResponse.data;

    const user = await User.findOneAndUpdate(
        { malId: profile.id },
        {
            username: profile.name,
            avatar: profile.picture,
            accessToken: access_token,
            refreshToken: refresh_token
        },
        { returnDocument: "after", upsert: true }
    );

    if (returnToPath.startsWith('zuko://')) {
        return res.redirect(`${returnToPath}?accessToken=${access_token}&refreshToken=${refresh_token}`);
    } else {
        return res
            .cookie("access_token", access_token, options)
            .cookie("refresh_token", refresh_token, options)
            .cookie("user_id", user.malId, options)
            .redirect(`${frontendUrl}${returnToPath}`);
    }
});

const getProfile = asyncHandler(async (req, res) => {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null;

    const accessToken = bearer || req.cookies?.access_token;

    if (!accessToken) {
        throw new ApiError(401, "User is not authenticated");
    }

    const response = await axios.get(
        "https://api.myanimelist.net/v2/users/@me",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    return res.status(200).json(
        new ApiResponse(200, response.data, "User profile fetched Successfully")
    );
});

export {
    login,
    callback,
    getProfile
};