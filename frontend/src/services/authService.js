import apiClient from "./api";

const loginHandle = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4002/api'}/auth/login`;
}

const getAccess = async (code, state) => {
    try {
        const response = await apiClient.get(
            '/auth/callback',
            {
                params: {
                    code,
                    state
                }
            }
        )

        return response.data
    } catch (error) {
        throw error
    }
}

export { loginHandle, getAccess }