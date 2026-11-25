
import {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
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
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Prevent old requests from overwriting newer login state
    const authVersion = useRef(0);

    const updateUser = (newUser: AuthUser | null) => {
        authVersion.current += 1;
        setUser(newUser);
    };

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
                    const loggedUser =
                        response.user ??
                        response.data?.user ??
                        null;

                    setUser(loggedUser);

                    console.log(
                        "AUTH CHECK USER:",
                        loggedUser
                    );
                }

            } catch (error) {
                if (
                    mounted &&
                    authVersion.current === requestVersion
                ) {
                    setUser(null);
                }

                if (
                    axios.isAxiosError(error) &&
                    error.response?.status !== 401
                ) {
                    console.error(
                        "Authentication error:",
                        error
                    );
                }

            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        const handleSessionExpired = () => {
            updateUser(null);
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

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            updateUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser: updateUser,
                loading,
                logout: handleLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};
