
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";

import axios from "axios";

import {
    getUser,
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

    const [user, setUserState] = useState<AuthUser | null>(null);

    const [loading, setLoading] = useState(true);

    // Track authentication changes
    const authVersion = useRef(0);

    // Update user globally
    const setUser = (newUser: AuthUser | null) => {

        authVersion.current += 1;

        setUserState(newUser);
    };

    // Check logged-in user
    useEffect(() => {

        let mounted = true;

        const requestVersion = authVersion.current;

        const checkUser = async () => {

            try {

                const response = await getUser();

                if (
                    mounted &&
                    authVersion.current === requestVersion
                ) {

                    setUserState(response.user ?? null);

                }

            } catch (error) {

                if (
                    mounted &&
                    authVersion.current === requestVersion
                ) {

                    setUserState(null);

                }

                if (
                    axios.isAxiosError(error) &&
                    error.response?.status !== 401
                ) {

                    console.error(
                        "Auth check failed:",
                        error
                    );

                }

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }
        };

        // Handle expired session
        const handleSessionExpired = () => {

            setUser(null);

        };

        window.addEventListener(
            "auth:session-expired",
            handleSessionExpired
        );

        checkUser();

        return () => {

            mounted = false;

            window.removeEventListener(
                "auth:session-expired",
                handleSessionExpired
            );

        };

    }, []);

    // Logout function
    const logout = async () => {

        try {

            await logoutApi();

        } catch (error) {

            console.error("Logout failed:", error);

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
                logout,
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
