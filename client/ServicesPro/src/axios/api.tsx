
import axios, {
    type InternalAxiosRequestConfig,
} from "axios";

declare module "axios" {
    interface AxiosRequestConfig {
        skipAuthRefresh?: boolean;
    }

    interface InternalAxiosRequestConfig {
        skipAuthRefresh?: boolean;
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

        if (
            !originalRequest ||
            error.response?.status !== 401
        ) {
            return Promise.reject(error);
        }

        const url = originalRequest.url || "";

        const excludedEndpoints = [
            "/users/login",
            "/users/signup",
            "/users/refreshToken",
            "/users/logout",
        ];

        if (
            originalRequest.skipAuthRefresh ||
            originalRequest._retry ||
            excludedEndpoints.some((endpoint) =>
                url.includes(endpoint)
            )
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
            window.dispatchEvent(
                new Event("auth:session-expired")
            );

            return Promise.reject(refreshError);
        }
    }
);

export default api;
