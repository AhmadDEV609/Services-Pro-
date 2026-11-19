
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock,
    CreditCard,
    LoaderCircle,
    MapPin,
    ShieldCheck,
    UserRound,
    Wallet,
} from "lucide-react";

import {
    getApprovedProviders,
    type ProviderProfile,
} from "../axios/provider.api.tsx";

import {
    createCashBooking,
    createOnlineBooking,
} from "../axios/booking.api";

type PaymentMethod = "online" | "cash";

type BookingDate = {
    fullDate: string;
    day: string;
    date: number;
    month: string;
    dayName: string;
};

const ExploreDetail = () => {
    const { providerId } = useParams<{ providerId: string }>();
    const navigate = useNavigate();

    const [provider, setProvider] = useState<ProviderProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedDate, setSelectedDate] = useState("");
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>("online");

    const [bookingMessage, setBookingMessage] = useState("");
    const [bookingLoading, setBookingLoading] = useState(false);

    // Generate next 7 dates using local date
    const dates = useMemo<BookingDate[]>(() => {
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date();

            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() + index);

            const year = date.getFullYear();
            const monthNumber = String(date.getMonth() + 1).padStart(2, "0");
            const dayNumber = String(date.getDate()).padStart(2, "0");

            return {
                fullDate: `${year}-${monthNumber}-${dayNumber}`,
                day: date.toLocaleDateString("en-US", {
                    weekday: "short",
                }),
                date: date.getDate(),
                month: date.toLocaleDateString("en-US", {
                    month: "short",
                }),
                dayName: date.toLocaleDateString("en-US", {
                    weekday: "long",
                }),
            };
        });
    }, []);

    // Fetch approved provider details
    useEffect(() => {
        const fetchProvider = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getApprovedProviders({
                    page: 1,
                    limit: 100,
                    search: "",
                    category: "",
                });

                const foundProvider = response.providers.find(
                    (item) => item._id === providerId
                );

                if (!foundProvider) {
                    setError(
                        "Provider not found or is no longer available."
                    );
                    return;
                }

                setProvider(foundProvider);
            } catch (err: unknown) {
                const axiosError = err as {
                    response?: {
                        data?: {
                            message?: string;
                        };
                    };
                };

                setError(
                    axiosError.response?.data?.message ||
                    "Unable to load provider details."
                );
            } finally {
                setLoading(false);
            }
        };

        if (providerId) {
            fetchProvider();
        } else {
            setError("Invalid provider ID.");
            setLoading(false);
        }
    }, [providerId]);

    // Find working hours for a particular day
    const getWorkingHours = (dayName: string) => {
        return provider?.workingHours?.find(
            (hour) =>
                hour.day.toLowerCase() === dayName.toLowerCase()
        );
    };

    // Check whether provider is available on selected day
    const isDayAvailable = (dayName: string) => {
        const workingDay = getWorkingHours(dayName);

        return Boolean(workingDay && !workingDay.isClosed);
    };

    // Find selected date details
    const selectedDay = dates.find(
        (date) => date.fullDate === selectedDate
    );

    // Working hours of selected date
    const selectedWorkingHours = selectedDay
        ? getWorkingHours(selectedDay.dayName)
        : null;

    // Select appointment date
    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setBookingMessage("");
    };

    // Continue booking
    const handleBookingContinue = async () => {
        setBookingMessage("");

        if (!providerId) {
            setBookingMessage("Invalid provider ID.");
            return;
        }

        if (!selectedDate) {
            setBookingMessage("Please select an appointment date.");
            return;
        }

        if (!selectedDay) {
            setBookingMessage("Invalid appointment date.");
            return;
        }

        if (
            !selectedWorkingHours ||
            selectedWorkingHours.isClosed
        ) {
            setBookingMessage(
                "This provider is not available on the selected day."
            );
            return;
        }

        try {
            setBookingLoading(true);

            // Convert selected date to UTC ISO format
            const appointmentDate = new Date(
                `${selectedDate}T00:00:00.000Z`
            ).toISOString();

            // Send date and weekday to backend
            const bookingData = {
                date: appointmentDate,
                day: selectedDay.dayName,
            };

            // Cash booking
            if (paymentMethod === "cash") {
                const response = await createCashBooking(
                    providerId,
                    bookingData
                );

                setBookingMessage(
                    response.message ||
                    "Your cash booking request has been created successfully."
                );

                return;
            }

            // Online booking
            const response = await createOnlineBooking(
                providerId,
                bookingData
            );

            if (!response.url) {
                throw new Error(
                    "Stripe checkout URL was not received."
                );
            }

            // Redirect customer to Stripe Checkout
            window.location.assign(response.url);
        } catch (err: unknown) {
            const axiosError = err as {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
            };

            const message =
                axiosError.response?.data?.message ||
                (err instanceof Error
                    ? err.message
                    : "Something went wrong while creating your booking.");

            setBookingMessage(message);
        } finally {
            setBookingLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC]">
                <LoaderCircle
                    size={40}
                    className="animate-spin text-teal-600"
                />

                <p className="mt-4 text-sm font-medium text-gray-500">
                    Loading provider details...
                </p>
            </div>
        );
    }

    // Error state
    if (error || !provider) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
                <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <UserRound size={30} />
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-gray-900">
                        Provider Not Found
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        {error || "This provider is currently unavailable."}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/customer/explore")}
                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                    >
                        <ArrowLeft size={17} />
                        Back to Explore
                    </button>
                </div>
            </div>
        );
    }

    const user =
        typeof provider.providerInfo === "object"
            ? provider.providerInfo
            : null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-12">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">

                {/* Back Button */}
                <button
                    type="button"
                    onClick={() => navigate("/customer/explore")}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-teal-700"
                >
                    <ArrowLeft size={18} />
                    Back to Explore
                </button>

                <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12">

                    {/* LEFT SIDE: PROVIDER DETAILS */}
                    <div className="space-y-6 lg:col-span-5">

                        {/* Provider Profile */}
                        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

                            {/* Cover */}
                            <div className="relative h-40 bg-linear-to-br from-teal-700 via-teal-600 to-emerald-500 sm:h-48">
                                <div className="absolute inset-0 overflow-hidden opacity-20">
                                    <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border-30 border-white" />
                                    <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full border-25 border-white" />
                                </div>

                                <div className="absolute left-5 top-5 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                                    Verified Professional
                                </div>
                            </div>

                            {/* Profile Information */}
                            <div className="px-5 pb-6 sm:px-7">
                                <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-teal-50 shadow-md">
                                        {user?.image ? (
                                            <img
                                                src={user.image}
                                                alt={user.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <UserRound
                                                size={48}
                                                className="text-teal-600"
                                            />
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5 self-start rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:self-auto">
                                        <CheckCircle2 size={15} />
                                        Approved Provider
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <p className="text-sm font-semibold text-teal-700">
                                        {provider.serviceCategory}
                                    </p>

                                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                        {provider.businessName}
                                    </h1>

                                    <p className="mt-2 text-sm text-gray-500">
                                        Professional service by{" "}
                                        <span className="font-semibold text-gray-800">
                                            {user?.name || "Service Provider"}
                                        </span>
                                    </p>

                                    {user?.email && (
                                        <p className="mt-1 break-all text-sm text-gray-500">
                                            {user.email}
                                        </p>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl bg-gray-50 p-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <BriefcaseBusiness size={17} />
                                            <span className="text-xs">
                                                Experience
                                            </span>
                                        </div>

                                        <p className="mt-2 text-lg font-bold text-gray-900">
                                            {provider.experience} Years
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-gray-50 p-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <MapPin size={17} />
                                            <span className="text-xs">
                                                City
                                            </span>
                                        </div>

                                        <p className="mt-2 truncate text-lg font-bold text-gray-900">
                                            {provider.businessLocation?.city || "Not specified"}
                                        </p>
                                    </div>
                                </div>

                                {/* Charges */}
                                <div className="mt-5 flex items-center justify-between rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">
                                            Service Charges
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-teal-800">
                                            Rs. {provider.serviceCharges.toLocaleString("en-PK")}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-white p-3 text-teal-700 shadow-sm">
                                        <Wallet size={22} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About Provider */}
                        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                            <h2 className="text-lg font-bold text-gray-900">
                                About Professional
                            </h2>

                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                                {provider.description}
                            </p>
                        </div>

                        {/* Business Location */}
                        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                    <MapPin size={21} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-gray-900">
                                        Business Location
                                    </h2>

                                    <p className="text-xs text-gray-500">
                                        Provider's registered location
                                    </p>
                                </div>
                            </div>

                            <p className="mt-4 text-sm leading-6 text-gray-600">
                                {provider.businessLocation?.address || "Address not provided"}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-800">
                                {[
                                    provider.businessLocation?.city,
                                    provider.businessLocation?.state,
                                    provider.businessLocation?.country,
                                    provider.businessLocation?.postalCode,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </p>
                        </div>

                        {/* Complete Working Hours */}
                        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Clock size={21} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-gray-900">
                                        Working Hours
                                    </h2>

                                    <p className="text-xs text-gray-500">
                                        Provider's weekly schedule
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {provider.workingHours?.map((hour) => (
                                    <div
                                        key={hour.day}
                                        className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                                    >
                                        <span className="text-sm font-medium text-gray-700">
                                            {hour.day}
                                        </span>

                                        <span
                                            className={`text-sm font-semibold ${hour.isClosed
                                                ? "text-red-500"
                                                : "text-emerald-700"
                                                }`}
                                        >
                                            {hour.isClosed
                                                ? "Closed"
                                                : `${hour.open} - ${hour.close}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: BOOKING */}
                    <div className="lg:col-span-7">
                        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

                            {/* Booking Header */}
                            <div className="bg-linear-to-r from-[#E7F5F5] to-[#F0F8F8] px-5 py-6 sm:px-8">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
                                        <CalendarDays size={24} />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                            Book an Appointment
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Select your preferred day and payment method.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 p-5 sm:p-8">

                                {/* Select Appointment Date */}
                                <section>
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <h3 className="font-bold text-gray-900">
                                            Choose Appointment Day
                                        </h3>

                                        <span className="text-xs font-medium text-gray-400">
                                            Next 7 days
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                                        {dates.map((date) => {
                                            const isSelected =
                                                selectedDate === date.fullDate;

                                            const available =
                                                isDayAvailable(date.dayName);

                                            return (
                                                <button
                                                    key={date.fullDate}
                                                    type="button"
                                                    disabled={!available || bookingLoading}
                                                    onClick={() =>
                                                        handleDateSelect(date.fullDate)
                                                    }
                                                    className={`flex min-h-24 flex-col items-center justify-center rounded-2xl border px-2 py-3 transition ${isSelected
                                                        ? "border-[#38251F] bg-[#38251F] text-white shadow-md"
                                                        : !available
                                                            ? "cursor-not-allowed border-gray-100 bg-gray-100 text-gray-300"
                                                            : "border-gray-100 bg-[#EAF5F6] text-gray-700 hover:border-teal-300 hover:bg-teal-50"
                                                        }`}
                                                >
                                                    <span className="text-xs font-medium">
                                                        {date.day}
                                                    </span>

                                                    <span className="mt-1 text-xl font-bold">
                                                        {date.date}
                                                    </span>

                                                    <span className="mt-0.5 text-[10px]">
                                                        {!available
                                                            ? "Closed"
                                                            : date.month}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {selectedDate && (
                                        <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-teal-800">
                                                <CheckCircle2 size={17} />
                                                Selected Appointment Date
                                            </div>

                                            <p className="mt-2 text-sm text-gray-700">
                                                {new Date(
                                                    `${selectedDate}T12:00:00`
                                                ).toLocaleDateString("en-US", {
                                                    weekday: "long",
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </p>

                                            {selectedWorkingHours &&
                                                !selectedWorkingHours.isClosed && (
                                                    <div className="mt-3 flex items-center gap-2 text-sm text-teal-800">
                                                        <Clock size={16} />

                                                        Working Hours:{" "}

                                                        <span className="font-bold">
                                                            {selectedWorkingHours.open} -{" "}
                                                            {selectedWorkingHours.close}
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </section>

                                {/* Payment Method */}
                                <section>
                                    <div className="mb-4">
                                        <h3 className="font-bold text-gray-900">
                                            Select Payment Method
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Choose how you want to pay for this service.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                        {/* Online Payment */}
                                        <button
                                            type="button"
                                            disabled={bookingLoading}
                                            onClick={() => {
                                                setPaymentMethod("online");
                                                setBookingMessage("");
                                            }}
                                            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${paymentMethod === "online"
                                                ? "border-teal-600 bg-teal-50 ring-2 ring-teal-600/10"
                                                : "border-gray-200 bg-white hover:border-teal-300"
                                                }`}
                                        >
                                            <div
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${paymentMethod === "online"
                                                    ? "bg-teal-600 text-white"
                                                    : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                <CreditCard size={21} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-gray-900">
                                                    Online Payment
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Pay securely online
                                                </p>
                                            </div>

                                            {paymentMethod === "online" && (
                                                <CheckCircle2
                                                    size={20}
                                                    className="shrink-0 text-teal-600"
                                                />
                                            )}
                                        </button>

                                        {/* Cash Payment */}
                                        <button
                                            type="button"
                                            disabled={bookingLoading}
                                            onClick={() => {
                                                setPaymentMethod("cash");
                                                setBookingMessage("");
                                            }}
                                            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${paymentMethod === "cash"
                                                ? "border-teal-600 bg-teal-50 ring-2 ring-teal-600/10"
                                                : "border-gray-200 bg-white hover:border-teal-300"
                                                }`}
                                        >
                                            <div
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${paymentMethod === "cash"
                                                    ? "bg-teal-600 text-white"
                                                    : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                <Wallet size={21} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-gray-900">
                                                    Cash on Place
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Pay after service
                                                </p>
                                            </div>

                                            {paymentMethod === "cash" && (
                                                <CheckCircle2
                                                    size={20}
                                                    className="shrink-0 text-teal-600"
                                                />
                                            )}
                                        </button>
                                    </div>
                                </section>

                                {/* Booking Summary */}
                                <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
                                    <h3 className="font-bold text-gray-900">
                                        Booking Summary
                                    </h3>

                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="text-gray-500">
                                                Provider
                                            </span>

                                            <span className="text-right font-semibold text-gray-800">
                                                {provider.businessName}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="text-gray-500">
                                                Service
                                            </span>

                                            <span className="text-right font-semibold text-gray-800">
                                                {provider.serviceCategory}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="text-gray-500">
                                                Appointment Date
                                            </span>

                                            <span className="text-right font-semibold text-gray-800">
                                                {selectedDate || "Not selected"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="text-gray-500">
                                                Working Hours
                                            </span>

                                            <span className="text-right font-semibold text-gray-800">
                                                {selectedWorkingHours &&
                                                    !selectedWorkingHours.isClosed
                                                    ? `${selectedWorkingHours.open} - ${selectedWorkingHours.close}`
                                                    : "Not selected"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="text-gray-500">
                                                Payment Method
                                            </span>

                                            <span className="text-right font-semibold text-gray-800">
                                                {paymentMethod === "online"
                                                    ? "Online Payment"
                                                    : "Cash on Place"}
                                            </span>
                                        </div>

                                        <div className="border-t border-gray-200 pt-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-semibold text-gray-700">
                                                    Total Charges
                                                </span>

                                                <span className="text-xl font-bold text-teal-800">
                                                    Rs.{" "}
                                                    {provider.serviceCharges.toLocaleString("en-PK")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Booking Message */}
                                {bookingMessage && (
                                    <div
                                        className={`rounded-xl border p-4 text-sm leading-6 ${bookingMessage.toLowerCase().includes("successfully")
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                            : "border-amber-200 bg-amber-50 text-amber-800"
                                            }`}
                                    >
                                        {bookingMessage}
                                    </div>
                                )}

                                {/* Continue Button */}
                                <button
                                    type="button"
                                    onClick={handleBookingContinue}
                                    disabled={bookingLoading}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#38251F] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#38251F]/10 transition hover:bg-[#4A3028] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {bookingLoading ? (
                                        <>
                                            <LoaderCircle
                                                size={18}
                                                className="animate-spin"
                                            />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Continue / Book
                                            <Check size={18} />
                                        </>
                                    )}
                                </button>

                                {/* Security Note */}
                                <div className="flex items-center justify-center gap-2 text-center text-xs text-gray-400">
                                    <ShieldCheck
                                        size={16}
                                        className="text-emerald-600"
                                    />

                                    Your booking information is handled securely.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExploreDetail;
