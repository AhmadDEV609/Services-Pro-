
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import axios from "axios";

import {
    getUser,
    refreshToken,
    logout as logoutApi,
    type AuthUser,
} from "../axios/auth.api";

interface AuthContextType {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

export const AuthProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const checkUser = async () => {
            try {
                // First check logged-in user
                const response = await getUser();

                if (mounted) {
                    setUser(response.user ?? response.data?.user ?? null);
                }

            } catch (error) {

                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 401
                ) {
                    try {
                        // Try refreshing the session
                        await refreshToken();

                        // Get user after successful refresh
                        const response = await getUser();

                        if (mounted) {
                            setUser(
                                response.user ??
                                response.data?.user ??
                                null
                            );
                        }

                    } catch (refreshError) {

                        if (mounted) {
                            setUser(null);
                        }

                        if (
                            !axios.isAxiosError(refreshError) ||
                            refreshError.response?.status !== 401
                        ) {
                            console.error(
                                "Session refresh failed:",
                                refreshError
                            );
                        }
                    }

                } else {
                    if (mounted) {
                        setUser(null);
                    }

                    console.error(
                        "Authentication check failed:",
                        error
                    );
                }

            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        checkUser();

        // Handle expired session
        const handleSessionExpired = () => {
            if (mounted) {
                setUser(null);
            }
        };

        window.addEventListener(
            "auth:session-expired",
            handleSessionExpired
        );

        return () => {
            mounted = false;

            window.removeEventListener(
                "auth:session-expired",
                handleSessionExpired
            );
        };
    }, []);

    // Logout function
    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.error("Logout API error:", error);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                logout: handleLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};
