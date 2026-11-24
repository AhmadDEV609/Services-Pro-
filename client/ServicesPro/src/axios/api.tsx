
import axios, {
    type InternalAxiosRequestConfig,
} from "axios";

interface RetryRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// Use frontend's own domain through Vercel proxy
const baseURL = "/api/v1";

const api = axios.create({
    baseURL,
    withCredentials: true,
});

const refreshApi = axios.create({
    baseURL,
    withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest =
            error.config as RetryRequestConfig | undefined;

        if (!originalRequest || error.response?.status !== 401) {
            return Promise.reject(error);
        }

        const url = originalRequest.url || "";

        // Don't refresh authentication endpoints
        if (
            url.includes("/users/login") ||
            url.includes("/users/signup") ||
            url.includes("/users/refreshToken") ||
            url.includes("/users/logout")
        ) {
            return Promise.reject(error);
        }

        // Prevent infinite retry
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            // Share one refresh request between simultaneous 401s
            if (!refreshPromise) {
                refreshPromise = refreshApi
                    .post("/users/refreshToken")
                    .then(() => undefined)
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            await refreshPromise;

            // Retry original request
            return api(originalRequest);

        } catch (refreshError) {
            window.dispatchEvent(
                new Event("auth:session-expired")
            );

            return Promise.reject(refreshError);
        }
    }
);

export default api;
