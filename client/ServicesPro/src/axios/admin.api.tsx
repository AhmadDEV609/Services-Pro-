import api from "./api";

export type ProviderStatus = "pending" | "approved" | "rejected";

export interface ProviderUser {
    _id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
}

export interface WorkingHour {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
}

export interface ProviderRequest {
    _id: string;
    providerInfo: ProviderUser | null;
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
    approvalStatus: ProviderStatus;
    rejectionReason?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface ProviderRequestsResponse {
    success: boolean;
    providers: ProviderRequest[];
    message?: string;
}

interface UpdateProviderStatusResponse {
    success: boolean;
    message: string;
    provider: ProviderRequest;
}

// Get all provider requests (Pending, Approved, Rejected)
export const getAllProviderRequests = async (): Promise<
    ProviderRequest[]
> => {
    const response = await api.get<ProviderRequestsResponse>("/provider/all");

    return response.data.providers;
};

// Approve or reject provider request
export const updateProviderStatus = async (
    providerId: string,
    approvalStatus: ProviderStatus,
    rejectionReason?: string
): Promise<ProviderRequest> => {
    const response = await api.patch<UpdateProviderStatusResponse>(
        `/provider/status/${providerId}`,
        {
            approvalStatus,
            rejectionReason: rejectionReason || "",
        }
    );

    return response.data.provider;
};

// Get only approved providers (for customer-facing pages)
export const getApprovedProviders = async (): Promise<ProviderRequest[]> => {
    const response = await api.get<ProviderRequestsResponse>(
        "/provider/approved"
    );

    return response.data.providers;
};