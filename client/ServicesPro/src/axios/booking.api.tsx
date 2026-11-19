
import api from "./api";

// ==============================
// Booking Payload
// ==============================

export interface BookingPayload {
    date: string;
    day: string;
}

// ==============================
// Provider Information
// ==============================

export interface BookingProvider {
    _id: string;
    businessName: string;
    serviceCategory: string;
    serviceCharges: number;

    businessLocation?: {
        address: string;
        city: string;
        state?: string;
        country?: string;
        postalCode?: string;
    };

    providerInfo?: {
        _id: string;
        name?: string;
        image?: string;
        email?: string;
    };
}

// ==============================
// Customer Information
// ==============================

export interface BookingCustomer {
    _id: string;
    name?: string;
    email?: string;
    image?: string;
}

// ==============================
// Booking Interface
// ==============================

export interface Booking {
    _id: string;
    provider: string;
    user: string;
    date: string;
    day: string;

    BookingStatus: "pending" | "approved" | "rejected";

    paymentMethod: "cash" | "online";

    paymentStatus: "pending" | "completed";
}

// ==============================
// Customer Booking
// ==============================

export interface CustomerBooking
    extends Omit<Booking, "provider"> {
    provider: BookingProvider;
}

// ==============================
// Provider Booking
// ==============================

export interface ProviderBooking
    extends Omit<Booking, "user"> {
    user: BookingCustomer;
}

// ==============================
// Booking Response
// ==============================

export interface BookingResponse {
    success: boolean;
    message: string;

    booking?: Booking;

    workingHours?: {
        open: string;
        close: string;
    };

    url?: string;
    sessionId?: string;
    bookingId?: string;
}

// ==============================
// Customer Bookings Response
// ==============================

export interface CustomerBookingsResponse {
    success: boolean;
    message: string;
    totalBookings: number;
    bookings: CustomerBooking[];
}

// ==============================
// Provider Bookings Response
// ==============================

export interface ProviderBookingsResponse {
    success: boolean;
    message: string;
    totalBookings: number;
    bookings: ProviderBooking[];
}

// ==============================
// Update Booking Status Response
// ==============================

export interface UpdateBookingStatusResponse {
    success: boolean;
    message: string;
    booking?: Booking;
}

// ==============================
// Create Cash Booking
// ==============================

export const createCashBooking = async (
    providerId: string,
    data: BookingPayload
): Promise<BookingResponse> => {
    const response = await api.post<BookingResponse>(
        `/booking/${providerId}`,
        data
    );

    return response.data;
};

// ==============================
// Create Online Booking
// ==============================

export const createOnlineBooking = async (
    providerId: string,
    data: BookingPayload
): Promise<BookingResponse> => {
    const response = await api.post<BookingResponse>(
        `/booking/online/${providerId}`,
        data
    );

    return response.data;
};

// ==============================
// Get Customer Bookings
// ==============================

export const getCustomerBookings =
    async (): Promise<CustomerBookingsResponse> => {
        const response = await api.get<CustomerBookingsResponse>(
            "/booking/my-bookings"
        );

        return response.data;
    };

// ==============================
// Get Provider Bookings
// ==============================

export const getProviderBookings =
    async (): Promise<ProviderBookingsResponse> => {
        const response = await api.get<ProviderBookingsResponse>(
            "/booking/provider-bookings"
        );

        return response.data;
    };

// ==============================
// Update Booking Status
// ==============================

export const updateBookingStatus = async (
    bookingId: string,
    status: "approved" | "rejected"
): Promise<UpdateBookingStatusResponse> => {
    const response = await api.patch<UpdateBookingStatusResponse>(
        `/booking/${bookingId}/status`,
        { status }
    );

    return response.data;
};
