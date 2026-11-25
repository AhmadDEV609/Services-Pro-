
import axios, {
    type InternalAxiosRequestConfig,
} from "axios";

// Add retry property
declare module "axios" {
    interface InternalAxiosRequestConfig {
        _retry?: boolean;
    }
}

// Main API
const api = axios.create({
    baseURL: "/api/v1",
    withCredentials: true,
});

// Refresh API
const refreshApi = axios.create({
    baseURL: "/api/v1",
    withCredentials: true,
});

// Prevent multiple refresh requests
let refreshPromise: Promise<void> | null = null;

// URLs excluded from refresh
const excludedUrls = [
    "/users/login",
    "/users/signup",
    "/users/refreshToken",
    "/users/logout",
];

// Response interceptor
api.interceptors.response.use(

    (response) => {
        return response;
    },

    async (error) => {

        const originalRequest =
            error.config as InternalAxiosRequestConfig | undefined;

        // Check error
        if (
            !originalRequest ||
            error.response?.status !== 401
        ) {
            return Promise.reject(error);
        }

        const url = originalRequest.url || "";

        // Avoid retry loops
        if (
            originalRequest._retry ||
            excludedUrls.some((path) => url.includes(path))
        ) {
            return Promise.reject(error);
        }

        // Mark request as retried
        originalRequest._retry = true;

        try {

            // Only one refresh request at a time
            if (!refreshPromise) {

                refreshPromise = refreshApi
                    .post("/users/refreshToken")
                    .then(() => undefined)
                    .finally(() => {
                        refreshPromise = null;
                    });

            }

            // Wait for refresh
            await refreshPromise;

            // Retry original request
            return api(originalRequest);

        } catch (refreshError) {

            refreshPromise = null;

            // Notify AuthContext
            window.dispatchEvent(
                new Event("auth:session-expired")
            );

            return Promise.reject(refreshError);

        }

    }
);

export default api;
