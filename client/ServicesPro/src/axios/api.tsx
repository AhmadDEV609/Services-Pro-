
import axios, {
    type InternalAxiosRequestConfig,
} from "axios";

const baseURL = import.meta.env.VITE_API_URL;

interface RetryRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const api = axios.create({
    baseURL,
    withCredentials: true,
});

const refreshApi = axios.create({
    baseURL,
    withCredentials: true,
});

let refreshPromise: Promise<unknown> | null = null;

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest =
            error.config as RetryRequestConfig | undefined;

        if (!originalRequest || error.response?.status !== 401) {
            return Promise.reject(error);
        }

        const url = originalRequest.url || "";

        // Don't refresh for authentication endpoints
        if (
            url.includes("/users/login") ||
            url.includes("/users/signup") ||
            url.includes("/users/refreshToken") ||
            url.includes("/users/logout")
        ) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = refreshApi
                    .post("/users/refreshToken")
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            await refreshPromise;

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
