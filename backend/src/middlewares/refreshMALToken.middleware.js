import axios from "axios";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
};

export const refreshMALToken = async (req, res, next) => {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null;

    let accessToken = bearer || req.cookies?.access_token;
    let refreshToken = req.cookies?.refresh_token;
    let malId = req.cookies?.user_id;

    if (!accessToken) {
        return next(new ApiError(401, "User is completely unauthenticated"));
    }

    // Mobile doesn't send cookies, so load from DB
    if (!refreshToken || !malId) {
        const user = await User.findOne({ accessToken });

        if (!user) {
            return next(new ApiError(401, "User not found"));
        }

        refreshToken = user.refreshToken;
        malId = user.malId;
    }

    try {
        await axios.get(
            "https://api.myanimelist.net/v2/users/@me",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return next();
    } catch (error) {
        if (error.response?.status === 401 && refreshToken) {
            try {
                const tokenPayload = {
                    client_id: process.env.MAL_CLIENT_ID,
                    client_secret: process.env.MAL_SECRET,
                    grant_type: "refresh_token",
                    refresh_token: refreshToken,
                };

                const refreshResponse = await axios.post(
                    "https://myanimelist.net/v1/oauth2/token",
                    new URLSearchParams(tokenPayload),
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    }
                );

                const {
                    access_token: newAccess,
                    refresh_token: newRefresh,
                } = refreshResponse.data;

                await User.findOneAndUpdate(
                    { malId },
                    {
                        accessToken: newAccess,
                        refreshToken: newRefresh,
                    }
                );

                // Web
                if (req.cookies?.access_token) {
                    res.cookie("access_token", newAccess, options);
                    res.cookie("refresh_token", newRefresh, options);
                    req.cookies.access_token = newAccess;
                    req.cookies.refresh_token = newRefresh;
                }

                // Mobile
                req.headers.authorization = `Bearer ${newAccess}`;

                return next();
            } catch (refreshError) {
                console.error(
                    "[AUTH CRITICAL]",
                    refreshError.response?.data || refreshError.message
                );

                return next(new ApiError(401, "Session expired, please log in again"));
            }
        }

        return next(
            new ApiError(
                error.response?.status || 500,
                "MAL External API Fault"
            )
        );
    }
};