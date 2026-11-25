
import api from "./api";

export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    image: string;
    role: "user" | "provider" | "admin";
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user: AuthUser;
}

export interface SignupData {
    name: string;
    email: string;
    password: string;
    role: "user" | "provider";
    image: File;
}

export interface LoginData {
    email: string;
    password: string;
}

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

export const login = async (
    userData: LoginData
): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(
        "/users/login",
        userData
    );

    return data;
};

export const getUser = async () => {
    const { data } = await api.get("/users/getUser");
    return data;
};

export const refreshToken = async () => {
    const { data } = await api.post("/users/refreshToken");
    return data;
};

export const logout = async () => {
    const { data } = await api.post("/users/logout");
    return data;
};
