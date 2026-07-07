import apiClient from "./api";

const loginHandle = () => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4002/api';
    window.location.href = `${backendUrl}/auth/login?returnTo=${encodeURIComponent(window.location.href)}`;
}

export { loginHandle }