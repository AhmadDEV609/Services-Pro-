
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";

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

    // Prevent old getUser requests from overwriting login state
    const authVersion = useRef(0);

    const setUser = (newUser: AuthUser | null) => {
        authVersion.current += 1;
        setUserState(newUser);
        setLoading(false);
    };

    useEffect(() => {
        let mounted = true;
        const currentVersion = authVersion.current;

        const checkAuth = async () => {
            try {
                const response = await getUser();

                if (
                    mounted &&
                    authVersion.current === currentVersion
                ) {
                    setUserState(response.user ?? null);
                }
            } catch (error) {
                if (
                    mounted &&
                    authVersion.current === currentVersion
                ) {
                    setUserState(null);
                }

                console.log("Session check:", error);
            } finally {
                if (
                    mounted &&
                    authVersion.current === currentVersion
                ) {
                    setLoading(false);
                }
            }
        };

        checkAuth();

        return () => {
            mounted = false;
        };
    }, []);

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

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};
