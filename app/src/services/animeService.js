import { Preferences } from "@capacitor/preferences";
import axios from 'axios'

const searchAnime = async (q) => {
    if (!q || !q.trim()) {
        console.log("Empty Query.")
        return null
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

        return formattedResults

    } catch (error) {
        console.log("Error while Searching: ", error)
    }
}

const getAnimeDetails = async (animeId) => {
    if (!animeId) {
        console.log("Anime ID parameter is strictly required")
        return null
    }
    
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}`)

        return response.data.data

    } catch (error) {
        console.log("Error while getting Anime Details: ", error)
        return null
    }
}

const getList = async () => {
    const {value: accessToken} = await Preferences.get({key: "accessToken"});

    if (!accessToken) {
        console.log("Authentication Failed.")
        return null
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

    return sortedCatalog
}

const getDiscover = async () => {
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

        return compoundPayload

    } catch (error) {
        console.log("Upstream GraphQL engine failed to resolve layout queries", error);
        return null
    }
}

const edit = async (animeId, currentEps, totalEps, score, status) => {
    const {value: accessToken} = await Preferences.get({key: "accessToken"});

    if (!accessToken) {
        console.log("Authentication Failed.")
        return null
    }

    if (!animeId) {
        console.log("Query parameter is required")
        return null
    }

    try {
        const formData = new URLSearchParams({
            status: status,
            score: score ? Number(score) : 0,
            num_watched_episodes: currentEps ? Number(currentEps) : 0
        }).toString()

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

        return response.data

    } catch (error) {
        console.log("Error while updating: ", error)
    }
}

const deleteAnime = async (animeId) => {
    const {value: accessToken} = await Preferences.get({key: "accessToken"});

    if (!accessToken) {
        console.log("Authentication Failed.")
        return null
    }

    if (!animeId) {
        console.log("Query parameter is required")
        return null
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

        return response.data
    } catch (error) {
        console.log("Error while deleting: ", error)
        return null
    }
}

const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return 'WINTER';
  if (month >= 3 && month <= 5) return 'SPRING';
  if (month >= 6 && month <= 8) return 'SUMMER';
  return 'FALL';
};

const getSeasonal = async (year, season) => {
  try {
    const currentYear = new Date().getFullYear();
    const queryYear = year || currentYear;
    
    const rawSeason = season ? season.toUpperCase() : getCurrentSeason();
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
              airingSchedule(perPage: 1, notYetAired: true) {
                nodes {
                  airingAt
                }
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

        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let broadcastDay = "N/A";
        let broadcastTime = "N/A";
        let formattedBroadcast = "N/A";

        const upcomingSchedule = anime.airingSchedule?.nodes?.[0];
        if (upcomingSchedule?.airingAt) {
          const date = new Date(upcomingSchedule.airingAt * 1000);
          
          broadcastDay = days[date.getDay()];
          broadcastTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          formattedBroadcast = `${broadcastDay} • ${broadcastTime}`;
        } else if (anime.status === 'FINISHED') {
          formattedBroadcast = "Finished Airing";
        }

        return {
          id: anime.idMal,
          title: anime.title.english || anime.title.romaji,
          image: anime.coverImage.large,
          totalEp: anime.episodes || 0,
          releasedEp: released,
          rating: anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 0,
          synopsis: anime.description || "No synopsis available.",
          status: anime.status,
          broadcastDay,
          broadcastTime,
          formattedBroadcast
        };
      });

    return {
        activeFilter: { year: queryYear, season: querySeason },
        results: validAnimeList
      }

  } catch (error) {
    console.log("Internal Error Occurred While Fetching Seasons", error)
    return null
  }
};

export { 
    searchAnime,
    getAnimeDetails,
    getDiscover,
    edit,
    getList,
    deleteAnime,
    getSeasonal
}