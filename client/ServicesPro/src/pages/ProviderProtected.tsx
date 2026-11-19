import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProviderProtected = () => {
    const { loading, user } = useAuth();

    if (loading) {
        return <h1>Loading...</h1>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "provider") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default ProviderProtected