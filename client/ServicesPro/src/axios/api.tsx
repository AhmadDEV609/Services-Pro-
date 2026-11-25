
import axios, {
    type InternalAxiosRequestConfig,
} from "axios";

declare module "axios" {
    interface InternalAxiosRequestConfig {
        _retry?: boolean;
    }
}

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
            error.config as InternalAxiosRequestConfig | undefined;

        if (!originalRequest || error.response?.status !== 401) {
            return Promise.reject(error);
        }

        const url = originalRequest.url || "";

        const excluded = [
            "/users/login",
            "/users/signup",
            "/users/refreshToken",
            "/users/logout",
        ];

        if (
            originalRequest._retry ||
            excluded.some((path) => url.includes(path))
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = refreshApi
                    .post("/users/refreshToken")
                    .then(() => undefined)
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            await refreshPromise;

            return api(originalRequest);
        } catch (refreshError) {
            refreshPromise = null;

            window.dispatchEvent(
                new Event("auth:session-expired")
            );

            return Promise.reject(refreshError);
        }
    }
);

export default api;
