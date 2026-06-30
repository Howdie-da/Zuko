import apiClient from "./api";
import { useSelector } from 'react-redux'

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

const deleteAnime = async (animeId) => {
  const response = await apiClient.delete(`/anime/delete?animeId=${animeId}`)
  return response.data
}

export { edit, deleteAnime }