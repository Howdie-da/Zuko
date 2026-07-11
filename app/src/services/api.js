import axios from "axios";
import { Preferences } from "@capacitor/preferences";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4002/api",
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(async (config) => {
    const { value } = await Preferences.get({
        key: "zuko_access_token",
    });

    if (value) {
        config.headers.Authorization = `Bearer ${value}`;
    }

    return config;
});

export default apiClient;