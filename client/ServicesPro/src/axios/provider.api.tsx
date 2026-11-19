
import api from "./api";

// -------------------- Working Hours --------------------

export type WorkingDay =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";

export interface WorkingHour {
    day: WorkingDay;
    open: string;
    close: string;
    isClosed: boolean;
}

// -------------------- Provider Profile Payload --------------------

export interface ProviderProfilePayload {
    businessName: string;
    description: string;
    experience: number;
    serviceCategory: string;
    serviceCharges: number;

    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;

    workingHours: WorkingHour[];
}

// -------------------- Provider User --------------------

export interface ProviderUser {
    _id: string;
    name: string;
    email: string;
    image: string;
}

// -------------------- Provider Profile --------------------

export interface ProviderProfile {
    _id: string;

    providerInfo: ProviderUser | string;

    businessName: string;
    description: string;
    experience: number;
    serviceCategory: string;
    serviceCharges: number;

    businessLocation: {
        address: string;
        city: string;
        state?: string;
        country?: string;
        postalCode?: string;
    };

    workingHours: WorkingHour[];

    approvalStatus: "pending" | "approved" | "rejected";

    rejectionReason?: string;

    createdAt: string;
    updatedAt: string;
}

// -------------------- Create / Get My Profile Response --------------------

export interface ProviderProfileResponse {
    success: boolean;
    message?: string;
    provider: ProviderProfile;
}

// -------------------- Explore Providers Response --------------------

export interface ProviderListResponse {
    success: boolean;
    message: string;

    providers: ProviderProfile[];

    total: number;
    totalPages: number;
    currentPage: number;

    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// -------------------- Create Provider Profile API --------------------

export const createProviderProfile = async (
    data: ProviderProfilePayload
): Promise<ProviderProfileResponse> => {
    const response = await api.post<ProviderProfileResponse>(
        "/provider",
        data
    );

    return response.data;
};

// -------------------- Get Logged-in Provider Profile API --------------------

export const getMyProviderProfile = async (): Promise<ProviderProfileResponse> => {
    const response = await api.get<ProviderProfileResponse>(
        "/provider"
    );

    return response.data;
};

// -------------------- Get Approved Providers API --------------------

export interface ProviderFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
}

export const getApprovedProviders = async (
    params: ProviderFilterParams = {}
): Promise<ProviderListResponse> => {
    const response = await api.get<ProviderListResponse>(
        "/provider/filter",
        {
            params: {
                page: params.page ?? 1,
                limit: params.limit ?? 10,
                search: params.search ?? "",
                category: params.category ?? "",
            },
        }
    );

    return response.data;
};
