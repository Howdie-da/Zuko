import apiClient from "./api";
import { useSelector } from 'react-redux'

const addToProfile = async (animeId) => {
    const response = await apiClient.patch(
        '/anime/edit',
        {
            status: "plan_to_watch",
            episodes: 0
        },
        {
            params: {
                animeId,
            }
        }
    )
    return response.data
}

const addOne = async (animeId, currentEps, totalEps) => {
    const nextEpisodeCount = totalEps ? Math.min(currentEps + 1, totalEps) : currentEps + 1
    const nextStatus = (totalEps && nextEpisodeCount === totalEps) ? 'completed' : 'watching'

    const response = await apiClient.patch(
        '/anime/edit',
        {
            status: nextStatus,
            episodes: nextEpisodeCount
        },
        {
            params: { animeId }
        }
    )
    return response.data
}

const edit = async (animeId, currentEps, totalEps, score, status) => {
    const response = await apiClient.patch(
        '/anime/edit',
        {
            status,
            episodes: totalEps > 0 ? Math.min(currentEps, totalEps) : currentEps,
            score
        },
        {
            params: { animeId }
        }
    )
    return response.data
}

export { addToProfile, addOne, edit }