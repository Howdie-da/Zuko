import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import axios from 'axios'

const searchAnime = asyncHandler(async (req, res) => {
    const { q, genres, producers, limit } = req.query || req.body || req.params
    
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime`, {
            params: {
                q,
                genres,
                producers,
                limit: limit || 20
            }
        })

        return res
        .status(200)
        .json(new ApiResponse(200, response.data.data))

    } catch (error) {
        const statusCode = error.response?.status || 500
        const message = error.response?.data?.message || "Upstream catalog sync failed"
        
        throw new ApiError(statusCode, message)
    }
})

const getAnimeDetails = asyncHandler(async (req, res) => {
    const animeId = req.query?.animeId || req.body?.animeId || req.params?.animeId

    if (!animeId) {
        throw new ApiError(400, "Anime ID parameter is strictly required")
    }
    
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}`)

        return res
            .status(200)
            .json(new ApiResponse(200, response.data.data))

    } catch (error) {
        const statusCode = error.response?.status || 500
        const message = error.response?.data?.message || "Upstream catalog sync failed"
        
        throw new ApiError(statusCode, message)
    }
})

const getSeasonal = asyncHandler(async (req, res) => {
    const year = req.query?.year || req.body?.year || req.params?.year
    const season = req.query?.season || req.body?.season || req.params?.season

    if (!year || !season) {
        throw new ApiError(400, "Query parameters are strictly required")
    }
    
    try {
        const page = req.query?.page || 1
        const limit = req.query?.limit || 20

        const response = await axios.get(`https://api.jikan.moe/v4/seasons/${year}/${season}`, {
            params: {
                page,
                limit,
                filter: 'tv'
            }
        })

        return res
        .status(200)
        .json(new ApiResponse(200, response.data.data))

    } catch (error) {
        const statusCode = error.response?.status || 500
        const message = error.response?.data?.message || "Upstream catalog sync failed"
        
        throw new ApiError(statusCode, message)
    }
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
                fields: "start_date,end_date,broadcast,synopsis,mean,rank,popularity,genres,num_episodes,my_list_status"
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

const getDiscover = asyncHandler(async (req, res) => {
    const query = `
      query {
        trending: Page(page: 1, perPage: 15) {
          media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
            id
            idMal
            title { english romaji }
            coverImage { extraLarge }
          }
        }
        action: Page(page: 1, perPage: 15) {
          media(genre_in: ["Action"], sort: SCORE_DESC, type: ANIME, isAdult: false) {
            id
            idMal
            title { english romaji }
            coverImage { extraLarge }
          }
        }
        scifi: Page(page: 1, perPage: 15) {
          media(genre_in: ["Sci-Fi"], sort: SCORE_DESC, type: ANIME, isAdult: false) {
            id
            idMal
            title { english romaji }
            coverImage { extraLarge }
          }
        }
        shounen: Page(page: 1, perPage: 15) {
          media(tag_in: ["Shounen"], sort: SCORE_DESC, type: ANIME, isAdult: false) {
            id
            idMal
            title { english romaji }
            coverImage { extraLarge }
          }
        }
        seinen: Page(page: 1, perPage: 15) {
          media(tag_in: ["Seinen"], sort: SCORE_DESC, type: ANIME, isAdult: false) {
            id
            idMal
            title { english romaji }
            coverImage { extraLarge }
          }
        }
        isekai: Page(page: 1, perPage: 15) {
          media(tag_in: ["Isekai"], sort: SCORE_DESC, type: ANIME, isAdult: false) {
            id
            idMal
            title { english romaji }
            coverImage { extraLarge }
          }
        }
      }
    `

    try {
        const response = await axios.post('https://graphql.anilist.co', { query });
        const data = response.data?.data;

        const mapToFrontendContract = (mediaArray) => {
            if (!mediaArray) return [];
            return mediaArray.map(anime => ({
                mal_id: anime.idMal,
                title: anime.title.english || anime.title.romaji,
                images: {
                    jpg: {
                        large_image_url: anime.coverImage.extraLarge
                    }
                }
            }));
        };

        const compoundPayload = {
            trending: mapToFrontendContract(data?.trending?.media),
            action: mapToFrontendContract(data?.action?.media),
            scifi: mapToFrontendContract(data?.scifi?.media),
            shounen: mapToFrontendContract(data?.shounen?.media),
            seinen: mapToFrontendContract(data?.seinen?.media),
            isekai: mapToFrontendContract(data?.isekai?.media)
        };

        return res
            .status(200)
            .json(new ApiResponse(200, compoundPayload, "Discover feed aggregated instantly via AniList GraphQL"));

    } catch (error) {
        console.error("AniList GraphQL Aggregation Crash:", error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        throw new ApiError(statusCode, "Upstream GraphQL engine failed to resolve layout queries");
    }
});

export {
    searchAnime,
    getAnimeDetails,
    getSeasonal,
    getList,
    getDiscover
}