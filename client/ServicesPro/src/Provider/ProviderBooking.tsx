
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import {
    CalendarDays,
    Check,
    CheckCircle2,
    Clock,
    RefreshCw,
    UserRound,
    X,
    XCircle,
    Wallet,
    CreditCard,
    LoaderCircle,
    ClipboardList,
} from "lucide-react";

import {
    getProviderBookings,
    updateBookingStatus,
    type ProviderBooking as ProviderBookingType,
} from "../axios/booking.api";

import axios from "axios";

type BookingFilter = "all" | "pending" | "approved" | "rejected";

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return (
            error.response?.data?.message ||
            error.message ||
            "Something went wrong."
        );
    }

    return "Something went wrong. Please try again.";
};

const ProviderBooking = () => {
    const [bookings, setBookings] = useState<ProviderBookingType[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<BookingFilter>("all");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch provider bookings
    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const response = await getProviderBookings();

            setBookings(response.bookings || []);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Update booking status
    const handleStatusChange = async (
        bookingId: string,
        status: "approved" | "rejected"
    ) => {
        try {
            setUpdatingId(bookingId);
            setError("");
            setSuccess("");

            const response = await updateBookingStatus(bookingId, status);

            // Update UI after successful API response
            setBookings((previousBookings) =>
                previousBookings.map((booking) =>
                    booking._id === bookingId
                        ? { ...booking, BookingStatus: status }
                        : booking
                )
            );

            setSuccess(response.message);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setUpdatingId(null);
        }
    };

    // Booking statistics
    const stats = useMemo(() => {
        return {
            total: bookings.length,

            pending: bookings.filter(
                (booking) => booking.BookingStatus === "pending"
            ).length,

            approved: bookings.filter(
                (booking) => booking.BookingStatus === "approved"
            ).length,

            rejected: bookings.filter(
                (booking) => booking.BookingStatus === "rejected"
            ).length,
        };
    }, [bookings]);

    // Filter bookings
    const filteredBookings = useMemo(() => {
        if (filter === "all") return bookings;

        return bookings.filter(
            (booking) => booking.BookingStatus === filter
        );
    }, [bookings, filter]);

    // Booking status styles
    const statusStyles: Record<BookingFilter, string> = {
        all: "bg-slate-100 text-slate-700 border-slate-200",
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        rejected: "bg-red-50 text-red-700 border-red-200",
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-teal-600">
                            Provider Dashboard
                        </p>

                        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                            My Bookings
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Manage your customer booking requests.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchBookings}
                        disabled={loading}
                        className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={17}
                            className={loading ? "animate-spin" : ""}
                        />

                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard
                        title="Total Bookings"
                        count={stats.total}
                        icon={<ClipboardList size={20} />}
                        color="text-slate-700"
                        bg="bg-slate-100"
                    />

                    <StatCard
                        title="Pending"
                        count={stats.pending}
                        icon={<Clock size={20} />}
                        color="text-amber-700"
                        bg="bg-amber-100"
                    />

                    <StatCard
                        title="Approved"
                        count={stats.approved}
                        icon={<CheckCircle2 size={20} />}
                        color="text-emerald-700"
                        bg="bg-emerald-100"
                    />

                    <StatCard
                        title="Rejected"
                        count={stats.rejected}
                        icon={<XCircle size={20} />}
                        color="text-red-700"
                        bg="bg-red-100"
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <XCircle size={18} className="mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                        <p>{success}</p>
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {(
                        ["all", "pending", "approved", "rejected"] as BookingFilter[]
                    ).map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setFilter(item)}
                            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${filter === item
                                ? "bg-teal-600 text-white"
                                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            {item === "all" ? "All Bookings" : item}
                        </button>
                    ))}
                </div>

                {/* Booking List */}
                {loading ? (
                    <div className="flex min-h-60 items-center justify-center">
                        <LoaderCircle
                            size={34}
                            className="animate-spin text-teal-600"
                        />
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <CalendarDays size={26} />
                        </div>

                        <h3 className="mt-4 text-lg font-bold text-slate-800">
                            No bookings found
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            There are no{" "}
                            {filter === "all" ? "" : filter} bookings to display.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {filteredBookings.map((booking) => {
                            const isUpdating = updatingId === booking._id;

                            return (
                                <div
                                    key={booking._id}
                                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                                >
                                    {/* Customer Info */}
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex min-w-0 items-center gap-3">
                                            {booking.user?.image ? (
                                                <img
                                                    src={booking.user.image}
                                                    alt={booking.user.name || "Customer"}
                                                    className="h-12 w-12 shrink-0 rounded-full border border-slate-200 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                                                    <UserRound size={23} />
                                                </div>
                                            )}

                                            <div className="min-w-0">
                                                <h3 className="truncate font-bold text-slate-900">
                                                    {booking.user?.name || "Customer"}
                                                </h3>

                                                <p className="truncate text-sm text-slate-500">
                                                    {booking.user?.email || "No email available"}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[booking.BookingStatus]
                                                }`}
                                        >
                                            {booking.BookingStatus}
                                        </span>
                                    </div>

                                    <div className="my-4 border-t border-slate-100" />

                                    {/* Booking Details */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <DetailItem
                                            icon={<CalendarDays size={17} />}
                                            label="Booking Date"
                                            value={formatDate(booking.date)}
                                        />

                                        <DetailItem
                                            icon={<Clock size={17} />}
                                            label="Day"
                                            value={booking.day}
                                        />

                                        <DetailItem
                                            icon={
                                                booking.paymentMethod === "online"
                                                    ? <CreditCard size={17} />
                                                    : <Wallet size={17} />
                                            }
                                            label="Payment Method"
                                            value={
                                                booking.paymentMethod === "online"
                                                    ? "Online Payment"
                                                    : "Cash on Place"
                                            }
                                        />

                                        <DetailItem
                                            icon={<Wallet size={17} />}
                                            label="Payment Status"
                                            value={booking.paymentStatus}
                                            valueClass={
                                                booking.paymentStatus === "completed"
                                                    ? "text-emerald-700"
                                                    : "text-amber-700"
                                            }
                                        />
                                    </div>

                                    {/* Booking ID */}
                                    <p className="mt-4 break-all text-xs text-slate-400">
                                        Booking ID: {booking._id}
                                    </p>

                                    {/* Actions */}
                                    {booking.BookingStatus === "pending" ? (
                                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <button
                                                type="button"
                                                disabled={isUpdating}
                                                onClick={() =>
                                                    handleStatusChange(
                                                        booking._id,
                                                        "approved"
                                                    )
                                                }
                                                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {isUpdating ? (
                                                    <LoaderCircle
                                                        size={17}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <Check size={17} />
                                                )}

                                                Approve Booking
                                            </button>

                                            <button
                                                type="button"
                                                disabled={isUpdating}
                                                onClick={() =>
                                                    handleStatusChange(
                                                        booking._id,
                                                        "rejected"
                                                    )
                                                }
                                                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {isUpdating ? (
                                                    <LoaderCircle
                                                        size={17}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <X size={17} />
                                                )}

                                                Reject Booking
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-600">
                                            {booking.BookingStatus === "approved"
                                                ? "You have confirmed this booking."
                                                : "You have rejected this booking."}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};


// Reusable Statistics Card
interface StatCardProps {
    title: string;
    count: number;
    icon: ReactNode;
    color: string;
    bg: string;
}

const StatCard = ({
    title,
    count,
    icon,
    color,
    bg,
}: StatCardProps) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                    {title}
                </p>

                <div className={`rounded-xl p-2 ${bg} ${color}`}>
                    {icon}
                </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-900">
                {count}
            </p>
        </div>
    );
};


// Reusable Booking Detail Item
interface DetailItemProps {
    icon: ReactNode;
    label: string;
    value: string;
    valueClass?: string;
}

const DetailItem = ({
    icon,
    label,
    value,
    valueClass = "text-slate-800",
}: DetailItemProps) => {
    return (
        <div className="flex min-w-0 items-start gap-2.5">
            <div className="mt-0.5 shrink-0 text-teal-600">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-xs text-slate-500">
                    {label}
                </p>

                <p className={`mt-1 wrap-break-word text-sm font-semibold capitalize ${valueClass}`}>
                    {value}
                </p>
            </div>
        </div>
    );
};

export default ProviderBooking;
