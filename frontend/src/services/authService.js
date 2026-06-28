import apiClient from "./api";

const loginHandle = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4002/api'}/auth/login`;
}

export { loginHandle }