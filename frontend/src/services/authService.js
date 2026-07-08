import apiClient from "./api";

const loginHandle = () => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4002/api';

    const currentPath = window.location.pathname;
    
    window.location.href = `${backendUrl}/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
};

export { loginHandle };