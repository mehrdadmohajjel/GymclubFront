import React, { createContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

export type User = {
    id: string;
    role: string;
    gymId?: string;
    nationalCode?: string;
};

type LoginResult = {
    success: boolean;
    message?: string;
    user?: User | null;
};


type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    initializing: boolean;
    login: (email: string, password: string, remember: boolean) => Promise<LoginResult>;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    loading: false,
    initializing: true,
    login: async () => ({ success: false }),
    logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    // Storage Layer
    const getTokens = () => ({
        accessToken: localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken"),
        refreshToken: localStorage.getItem("refreshToken") ?? sessionStorage.getItem("refreshToken")
    });

    const saveTokens = (access: string, refresh: string, remember: boolean) => {
        if (remember) {
            localStorage.setItem("accessToken", access);
            localStorage.setItem("refreshToken", refresh);
        } else {
            sessionStorage.setItem("accessToken", access);
            sessionStorage.setItem("refreshToken", refresh);
        }
    };

    const clearTokens = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
    };

    // Decode JWT
    const decodeUser = (token: string): User | null => {
        try {
            const decoded: any = jwtDecode(token);
            return {
                id: decoded.sub || decoded.nameid,
                role: decoded.role,
                gymId: decoded.gymId,
                nationalCode: decoded.nationalCode
            };
        } catch {
            return null;
        }
    };

    // Check expiration
    const isExpired = (token: string) => {
        try {
            const decoded: any = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    };

    // Auto refresh
    const refreshAccessToken = useCallback(async () => {
        const { refreshToken } = getTokens();
        if (!refreshToken) return null;

        try {
            const res = await api.post("/auth/refresh", { refreshToken });
            const at = res.data.accessToken;
            const rt = res.data.refreshToken ?? refreshToken;

            saveTokens(at, rt, true);
            const decoded = decodeUser(at);
            setUser(decoded);
            return at;
        } catch {
            logout();
            return null;
        }
    }, []);

    // Auto login on load
    useEffect(() => {
        const init = async () => {
            const { accessToken } = getTokens();
            if (!accessToken) {
                setInitializing(false);
                return;
            }

            if (isExpired(accessToken)) {
                await refreshAccessToken();
            } else {
                setUser(decodeUser(accessToken));
            }

            setInitializing(false);
        };

        init();
    }, []);

    // LOGIN function
    const login = async (email: string, password: string, remember: boolean): Promise<LoginResult> => {
        setLoading(true);

        try {
            const res = await api.post("/auth/login", { email, password });

            const accessToken = res.data.accessToken;
            const refreshToken = res.data.refreshToken;

            saveTokens(accessToken, refreshToken, remember);

            const decoded = decodeUser(accessToken);
            setUser(decoded);

            setLoading(false);

            return { success: true, user: decoded };

        } catch (err: any) {
            setLoading(false);

            return {
                success: false,
                message: err?.response?.data?.error ?? "خطا در ورود"
            };
        }
    };

    const logout = () => {
        clearTokens();
        setUser(null);
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: Boolean(user),
            loading,
            initializing,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
