
import api from "./api";

// USER TYPE
export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    image: string;
    role: "user" | "provider" | "admin";
}

// AUTH RESPONSE TYPE
export interface AuthResponse {
    success: boolean;
    message: string;
    user: AuthUser;
}

// SIGNUP DATA
export interface SignupData {
    name: string;
    email: string;
    password: string;
    role: "user" | "provider";
    image: File;
}

// LOGIN DATA
export interface LoginData {
    email: string;
    password: string;
}

// SIGNUP API
export const signup = async (
    userData: SignupData
): Promise<AuthResponse> => {

    const formData = new FormData();

    formData.append("name", userData.name);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("role", userData.role);
    formData.append("image", userData.image);

    const { data } = await api.post<AuthResponse>(
        "/users/signup",
        formData
    );

    return data;
};

// LOGIN API
export const login = async (
    userData: LoginData
): Promise<AuthResponse> => {

    const { data } = await api.post<AuthResponse>(
        "/users/login",
        userData
    );

    return data;
};

// GET LOGGED-IN USER
export const getUser = async (): Promise<{
    success: boolean;
    user: AuthUser;
}> => {

    const { data } = await api.get(
        "/users/getUser"
    );

    return data;
};

// REFRESH TOKEN API
export const refreshToken = async () => {

    const { data } = await api.post(
        "/users/refreshToken"
    );

    return data;
};

// LOGOUT API
export const logout = async () => {

    const { data } = await api.post(
        "/users/logout"
    );

    return data;
};
