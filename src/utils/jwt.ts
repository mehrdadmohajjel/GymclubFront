// src/utils/jwt.ts

export const getAccessToken = (): string | null => {
    return localStorage.getItem("accessToken");
};

export const getRefreshToken = (): string | null => {
    return localStorage.getItem("refreshToken");
};

export const setAccessToken = (token: string) => {
    localStorage.setItem("accessToken", token);
};

export const setRefreshToken = (token: string) => {
    localStorage.setItem("refreshToken", token);
};

export const clearTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};
