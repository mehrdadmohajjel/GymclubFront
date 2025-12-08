// src/api/axios.ts

import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse
} from "axios";

import {
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    clearTokens
} from "../utils/jwt";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "/api"; 
const api: AxiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 30000
});

// ------------------ Attach Access Token ------------------
api.interceptors.request.use((config) => {
        const token = getAccessToken();
    if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

// ------------------ Refresh Token Queue ------------------
let isRefreshing = false;

let failedQueue: {
    resolve: (value?: unknown) => void;
    reject: (error?: unknown) => void;
    config: AxiosRequestConfig;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((p) => {
        if (error) return p.reject(error);

        if (token && p.config.headers)
            p.config.headers["Authorization"] = `Bearer ${token}`;

        p.resolve(api(p.config));
    });

    failedQueue = [];
};

// ------------------ Response Interceptor ------------------
api.interceptors.response.use(
    (resp: AxiosResponse) => resp,

    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
            _retry?: boolean;
        };

        if (!originalRequest) return Promise.reject(error);

        const status = error.response?.status;

        // ----------- Handle 401 Unauthorized ------------
        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                clearTokens();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject, config: originalRequest });
                });
            }

            isRefreshing = true;

            try {
                const res = await axios.post(`${API_BASE}/auth/refresh`, {
                    refreshToken
                });

                const newAccessToken = res.data?.accessToken;
                if (!newAccessToken) {
                    clearTokens();
                    processQueue(new Error("No access token received"), null);
                    return Promise.reject(error);
                }

                setAccessToken(newAccessToken);
                processQueue(null, newAccessToken);

                if (originalRequest.headers)
                    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                clearTokens();
                processQueue(refreshError, null);

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
