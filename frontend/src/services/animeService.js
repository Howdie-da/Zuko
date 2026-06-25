import apiClient from "./api";

const searchAnime = async (toSearch, hideAdded = false) => {
    try {
        const response = await apiClient.get(
            '/anime/search', 
            {
                params: { toSearch, hideAdded }
            }
        )

        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

const getAnime = async (animeId) => {
    try {
        const respone = await apiClient.get(
            '/anime/details/${animeId}'
        )

        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

const getSeasonal = async (year, season) => {
    try {
        const respone = await apiClient.get(
            '/anime/season/${year}/${season}'
        )
        
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

export { searchAnime, getAnime, getSeasonal }