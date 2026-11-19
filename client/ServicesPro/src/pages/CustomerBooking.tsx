
import { useEffect, useState } from "react";
import {
    CalendarDays,
    Clock,
    MapPin,
    Wallet,
    CreditCard,
    BriefcaseBusiness,
    RefreshCw,
    ClipboardList,
} from "lucide-react";

import {
    getCustomerBookings,
    type CustomerBooking as CustomerBookingType,
} from "../axios/booking.api";

const CustomerBooking = () => {
    const [bookings, setBookings] = useState<CustomerBookingType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getCustomerBookings();

            if (response.success) {
                setBookings(response.bookings);
            } else {
                setError(response.message || "Unable to fetch bookings.");
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Something went wrong while fetching your bookings."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const getBookingStatus = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-700";
            case "rejected":
                return "bg-red-100 text-red-700";
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    const getPaymentStatus = (status: string) => {
        return status === "completed"
            ? "bg-green-100 text-green-700"
            : "bg-orange-100 text-orange-700";
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-100 border-t-cyan-600" />
                    <p className="text-sm font-medium text-gray-500">
                        Loading your bookings...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-6xl">

                {/* Page Header */}
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-cyan-600">
                            <ClipboardList size={17} />
                            <span>My Activity</span>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            My Bookings
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            View and track all your service bookings.
                        </p>
                    </div>

                    <button
                        onClick={fetchBookings}
                        className="flex w-fit items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-cyan-300 hover:text-cyan-700"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-red-700">{error}</p>

                        <button
                            onClick={fetchBookings}
                            className="w-fit text-sm font-semibold text-red-700 underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Booking Count */}
                <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Total Bookings
                    </p>

                    <p className="mt-1 text-3xl font-bold text-gray-900">
                        {bookings.length}
                    </p>
                </div>

                {/* Empty State */}
                {!error && bookings.length === 0 && (
                    <div className="rounded-2xl border border-gray-100 bg-white px-5 py-16 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50">
                            <CalendarDays
                                size={30}
                                className="text-cyan-600"
                            />
                        </div>

                        <h2 className="text-lg font-bold text-gray-900">
                            No bookings yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                            You haven't booked any services yet. Your bookings
                            will appear here once you make a reservation.
                        </p>
                    </div>
                )}

                {/* Booking Cards */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {bookings.map((booking) => {
                        const provider = booking.provider;

                        return (
                            <div
                                key={booking._id}
                                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                            >
                                {/* Card Header */}
                                <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-start">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50">
                                            <BriefcaseBusiness
                                                size={23}
                                                className="text-cyan-600"
                                            />
                                        </div>

                                        <div>
                                            <h2 className="font-bold text-gray-900">
                                                {provider?.businessName ||
                                                    "Service Provider"}
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {provider?.serviceCategory ||
                                                    "Service"}
                                            </p>
                                        </div>
                                    </div>

                                    <span
                                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getBookingStatus(
                                            booking.BookingStatus
                                        )}`}
                                    >
                                        {booking.BookingStatus}
                                    </span>
                                </div>

                                {/* Booking Details */}
                                <div className="space-y-4 p-5">
                                    <div className="flex items-center gap-3">
                                        <CalendarDays
                                            size={19}
                                            className="shrink-0 text-cyan-600"
                                        />

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Booking Date
                                            </p>
                                            <p className="mt-0.5 text-sm font-semibold text-gray-800">
                                                {formatDate(booking.date)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Clock
                                            size={19}
                                            className="shrink-0 text-cyan-600"
                                        />

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Day
                                            </p>
                                            <p className="mt-0.5 text-sm font-semibold text-gray-800">
                                                {booking.day}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <MapPin
                                            size={19}
                                            className="shrink-0 text-cyan-600"
                                        />

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Location
                                            </p>
                                            <p className="mt-0.5 text-sm font-semibold text-gray-800">
                                                {provider?.businessLocation
                                                    ? `${provider.businessLocation.city}, ${provider.businessLocation.address}`
                                                    : "Location not available"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="border-t border-gray-100 bg-gray-50 p-5">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Service Charges
                                            </p>

                                            <p className="mt-1 text-xl font-bold text-gray-900">
                                                Rs.{" "}
                                                {provider?.serviceCharges?.toLocaleString(
                                                    "en-PK"
                                                ) ?? "N/A"}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
                                            {booking.paymentMethod === "cash" ? (
                                                <Wallet
                                                    size={17}
                                                    className="text-cyan-600"
                                                />
                                            ) : (
                                                <CreditCard
                                                    size={17}
                                                    className="text-cyan-600"
                                                />
                                            )}

                                            <span className="text-xs font-semibold capitalize text-gray-700">
                                                {booking.paymentMethod}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
                                        <span className="text-sm text-gray-500">
                                            Payment Status
                                        </span>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPaymentStatus(
                                                booking.paymentStatus
                                            )}`}
                                        >
                                            {booking.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CustomerBooking;
