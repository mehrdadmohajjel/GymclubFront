import React, { createContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode"; 
import api from "../api/axios";

export type User = {
    id: string;
    role: string;
    gymId?: string;
    nationalCode?: string;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    initializing: boolean;
    login: (accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    loading: false,
    initializing: true,
    login: async () => { },
    logout: () => { }
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    // ------ Storage layer ------
    const getTokens = () => ({
        accessToken: localStorage.getItem("accessToken"),
        refreshToken: localStorage.getItem("refreshToken")
    });

    const saveTokens = (at: string, rt: string) => {
        localStorage.setItem("accessToken", at);
        localStorage.setItem("refreshToken", rt);
    };

    const clearTokens = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    };

    // ------ Decode User ------
    const decodeUser = (token: string): User | null => {
        try {
            const decoded: any = jwtDecode(token);

            const id =
                decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
                decoded.nameid ||
                decoded.sub;

            if (!id) return null;

            return {
                id,
                role: decoded.role,
                gymId: decoded.gymId,
                nationalCode: decoded.nationalCode
            };
        } catch {
            return null;
        }
    };

    // ------ Check token expiration ------
    const isExpired = (token: string): boolean => {
        try {
            const decoded: any = jwtDecode(token);
            if (!decoded.exp) return true;

            const now = Math.floor(Date.now() / 1000);
            return decoded.exp < now;
        } catch {
            return true;
        }
    };

    // ------ Auto refresh ------
    const refreshAccessToken = useCallback(async () => {
        const { refreshToken } = getTokens();
        if (!refreshToken) return null;

        try {
            const res = await api.post("/auth/refresh", { refreshToken });

            const newAT = res.data?.accessToken;
            const newRT = res.data?.refreshToken ?? refreshToken;

            if (newAT) {
                saveTokens(newAT, newRT);
                const decodedUser = decodeUser(newAT);
                setUser(decodedUser);
                return newAT;
            }

            logout();
            return null;
        } catch {
            logout();
            return null;
        }
    }, []);

    // ------ Auto login on page load ------
    useEffect(() => {
        const { accessToken } = getTokens();

        const init = async () => {
            if (!accessToken) {
                setUser(null);
                setInitializing(false);
                return;
            }

            if (isExpired(accessToken)) {
                await refreshAccessToken();
            } else {
                const decodedUser = decodeUser(accessToken);
                setUser(decodedUser);
            }

            setInitializing(false);
        };

        init();
    }, []);

    // ------ Login ------
    const login = async (accessToken: string, refreshToken: string) => {
        setLoading(true);

        saveTokens(accessToken, refreshToken);

        const decoded = decodeUser(accessToken);
        setUser(decoded);

        setLoading(false);
    };

    // ------ Logout ------
    const logout = () => {
        clearTokens();
        setUser(null);
        window.location.href = "/login";
    };

    // ------ Multi-tab logout sync ------
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === "accessToken" && !e.newValue) {
                logout();
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const isAuthenticated = Boolean(user);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                initializing,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
