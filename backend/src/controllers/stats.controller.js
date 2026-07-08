import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";

const getStats = asyncHandler(async (req, res) => {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null;

    const accessToken = bearer || req.cookies?.access_token;

    if (!accessToken) {
        throw new ApiError(401, "Authentication Failed");
    }

    const response = await axios.get(
        "https://api.myanimelist.net/v2/users/@me",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                fields: "id,name,picture,gender,joined_at,anime_statistics",
            },
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, response.data, "User Data has been fetched"));
});

export { getStats };