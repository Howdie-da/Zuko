import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import axios from 'axios'

const searchAnime = asyncHandler(async (req, res) => {
    const accessToken = req.cookies?.access_token
    
    if (!accessToken) {
        throw new ApiError(401, "Authentication Failed")
    }
    
    const toSearch = req.query?.toSearch || req.body?.toSearch
    const hideAdded = req.query?.hideAdded === "true" || req.body?.hideAdded === true

    if (toSearch.length < 3) {
        throw new ApiError(400, "Anime name should be atleast 3 character long.")
    }

    const response = await axios.get(
        "https://api.myanimelist.net/v2/anime",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                q: toSearch,
                limit: 50,
                fields: "synopsis,mean,rank,popularity,genres,num_episodes,my_list_status"

            }
        }
    )

    let animeResults = response.data.data

    if (hideAdded) {
        animeResults = animeResults.filter(
            (item) => !item.node.my_list_status || !item.node.my_list_status.status
        )
    }

    return res
    .status(200)
    .json(new ApiResponse(200, animeResults, "Anime search results fetched successfully"))
})

const getAnimeDetails = asyncHandler(async (req, res) => {
    const accessToken = req.cookies?.access_token

    if (!accessToken) {
        throw new ApiError(401, "Authentication Failed")
    }

    const animeId = req.query?.animeId || req.body?.animeId

    if (!animeId) {
        throw new ApiError(400, "Anime ID is required to fetch")
    }

    const response = await axios.get(
        `https://api.myanimelist.net/v2/anime/${animeId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                fields: "synopsis,mean,rank,popularity,genres,num_episodes,my_list_status"
            }
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, response.data, `Anime Details for ${animeId}`))
})

const getSeasonal = asyncHandler(async (req, res) => {
    const accessToken = req.cookies?.access_token

    if (!accessToken) {
        throw new ApiError(401, "Authentication Failed")
    }

    const year = req.query?.year || req.body?.year
    const season = req.query?.season || req.body?.season

    if (!year || !season) {
        throw new ApiError(400, "Choose Year and Season to fetch")
    }

    const response = await axios.get(
        `https://api.myanimelist.net/v2/anime/season/${year}/${season}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                sort: "anime_score",
                limit: 50,
                fields: "synopsis,mean,rank,popularity,genres,num_episodes,my_list_status"
            }
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, response.data, `Showing ${year} ${season} anime`))
})

const getList = asyncHandler(async (req, res) => {
    const accessToken = req.cookies?.access_token
    const userId = req.cookies?.user_id

    if (!accessToken || !userId) {
        throw new ApiError(401, "Authentication Failed")
    }

    const response = await axios.get(
        `https://api.myanimelist.net/v2/users/@me/animelist`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                sort: "list_updated_at",
                limit: 1000,
                fields: "synopsis,mean,rank,popularity,genres,num_episodes,my_list_status"
            }
        }
    )

    const rawArray = response.data?.data || []

    const sortedCatalog = {
        watching: rawArray.filter(item => item.node.my_list_status?.status === "watching"),
        completed: rawArray.filter(item => item.node.my_list_status?.status === "completed"),
        on_hold: rawArray.filter(item => item.node.my_list_status?.status === "on_hold"),
        dropped: rawArray.filter(item => item.node.my_list_status?.status === "dropped"),
        plan_to_watch: rawArray.filter(item => item.node.my_list_status?.status === "plan_to_watch")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, sortedCatalog, 'Categorized anime catalog served successfully'))
})

export {
    searchAnime,
    getAnimeDetails,
    getSeasonal,
    getList
}