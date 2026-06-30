import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import axios from 'axios'

const searchAnime = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || !q.trim()) {
        return res.status(200).json(new ApiResponse(200, [], "Empty query"));
    }

    const query = `
      query ($search: String) {
        Page(page: 1, perPage: 12) {
          media(search: $search, type: ANIME, isAdult: false) {
            id
            idMal
            title { english romaji }
            coverImage { extraLarge }
            status
            averageScore
          }
        }
      }
    `;

    try {
        const response = await axios.post('https://graphql.anilist.co', {
            query,
            variables: { search: q }
        });

        const rawMedia = response.data?.data?.Page?.media || [];

        const formattedResults = rawMedia.map(anime => ({
            mal_id: anime.idMal || anime.id, 
            title: anime.title.english || anime.title.romaji,
            images: {
                jpg: {
                    large_image_url: anime.coverImage.extraLarge
                }
            },
            score: anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 0,
            status: anime.status ? anime.status.toLowerCase().replace(/_/g, ' ') : 'unknown'
        }));

        return res
            .status(200)
            .json(new ApiResponse(200, formattedResults, "Search query executed successfully"));

    } catch (error) {
        console.error("Upstream Search Pipe Error:", error.response?.data || error.message);
        throw new ApiError(500, "Failed to fetch search results from upstream network");
    }
});

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

import qs from 'qs'

const edit = asyncHandler(async (req, res) => {
    const accessToken = req.cookies?.access_token

    if (!accessToken) {
        throw new ApiError(401, "Authentication Failed")
    }

    const animeId = req.query?.animeId

    if (!animeId) {
        throw new ApiError(400, "Query parameter is required")
    }

    const { status, episodes, score } = req.body

    try {
        const formData = qs.stringify({
            status,
            score: score ? Number(score) : 0,
            num_watched_episodes: episodes ? Number(episodes) : 0
        })

        const response = await axios.patch(
            `https://api.myanimelist.net/v2/anime/${animeId}/my_list_status`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )

        return res
            .status(200)
            .json(new ApiResponse(200, response.data, "Updation is Successful"))

    } catch (error) {
        throw new ApiError(
            error.response?.status || 500, 
            error.response?.data?.message || "Failed to update status tracking parameters inside upstream network node"
        )
    }
})

const deleteAnime = asyncHandler(async (req, res) => {
    const accessToken = req.cookies?.access_token

    if (!accessToken) {
        throw new ApiError(401, "Authentication Failed")
    }

    const animeId = req.query?.animeId

    if (!animeId) {
        throw new ApiError(400, "Query parameter is required")
    }

    try {
        const response = await axios.delete(
            `https://api.myanimelist.net/v2/anime/${animeId}/my_list_status`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )

        return res
        .status(200)
        .json(new ApiResponse(200, response.data, "Deletion Successful"))
    } catch (error) {
        throw new ApiError(500, "Internal Error Occured: ")
    }
})

const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return 'WINTER';
  if (month >= 3 && month <= 5) return 'SPRING';
  if (month >= 6 && month <= 8) return 'SUMMER';
  return 'FALL';
};

const getSeasonal = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const queryYear = parseInt(req.query.year) || currentYear;
    
    const rawSeason = req.query.season ? req.query.season.toUpperCase() : getCurrentSeason();
    const validSeasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
    const querySeason = validSeasons.includes(rawSeason) ? rawSeason : getCurrentSeason();

    const graphqlQuery = {
      query: `
        query ($season: MediaSeason, $seasonYear: Int, $perPage: Int) {
          Page(page: 1, perPage: $perPage) {
            media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: [POPULARITY_DESC]) {
              idMal
              title {
                english
                romaji
              }
              coverImage {
                large
              }
              episodes
              averageScore
              description
              status
              nextAiringEpisode {
                episode
              }
            }
          }
        }
      `,
      variables: {
        season: querySeason,
        seasonYear: queryYear,
        perPage: 50
      }
    };

    const response = await axios.post('https://graphql.anilist.co', graphqlQuery, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    const rawAnimeList = response.data?.data?.Page?.media || [];

    const validAnimeList = rawAnimeList
      .filter(anime => anime.idMal !== null)
      .map(anime => {
        let released = 0;
        if (anime.nextAiringEpisode) {
          released = anime.nextAiringEpisode.episode - 1;
        } else if (anime.status === 'FINISHED') {
          released = anime.episodes || 0;
        } else {
          released = 0;
        }

        return {
          id: anime.idMal,
          title: anime.title.english || anime.title.romaji,
          image: anime.coverImage.large,
          totalEp: anime.episodes || 0,
          releasedEp: released,
          rating: anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 0,
          synopsis: anime.description || "No synopsis available.",
          status: anime.status
        };
      });

    return res.status(200).json(
      new ApiResponse(200, {
        activeFilter: { year: queryYear, season: querySeason },
        results: validAnimeList
      }, "Seasonal Anime Fetched Successfully")
    );

  } catch (error) {
    throw new ApiError(500, "Internal Error Occurred While Fetching Seasons")
  }
};

export {
    searchAnime,
    getAnimeDetails,
    getList,
    getDiscover,
    edit,
    deleteAnime,
    getSeasonal
}