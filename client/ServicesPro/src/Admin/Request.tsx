import { useCallback, useEffect, useMemo, useState } from "react";

import {
    Search,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    MapPin,
    BriefcaseBusiness,
    Mail,
    CalendarDays,
    Eye,
    X,
    Loader2,
    AlertCircle,
    UserRound,
} from "lucide-react";

import {
    getAllProviderRequests,
    updateProviderStatus,
    type ProviderRequest,
    type ProviderStatus,
} from "../axios/admin.api";

type FilterStatus = "all" | ProviderStatus;

const filters: { label: string; value: FilterStatus }[] = [
    { label: "All Requests", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
];

const statusStyles: Record<ProviderStatus, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
};

const formatDate = (date?: string) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const Request = () => {
    const [providers, setProviders] = useState<ProviderRequest[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedProvider, setSelectedProvider] =
        useState<ProviderRequest | null>(null);

    const [rejectProvider, setRejectProvider] =
        useState<ProviderRequest | null>(null);

    const [rejectionReason, setRejectionReason] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState("");

    // Fetch all provider requests
    const fetchProviders = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAllProviderRequests();

            setProviders(data);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load provider requests."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    // Calculate statistics
    const counts = useMemo(
        () => ({
            all: providers.length,
            pending: providers.filter(
                (provider) => provider.approvalStatus === "pending"
            ).length,
            approved: providers.filter(
                (provider) => provider.approvalStatus === "approved"
            ).length,
            rejected: providers.filter(
                (provider) => provider.approvalStatus === "rejected"
            ).length,
        }),
        [providers]
    );

    // Search and filter providers
    const filteredProviders = useMemo(() => {
        const query = search.trim().toLowerCase();

        return providers.filter((provider) => {
            const matchesStatus =
                activeFilter === "all" ||
                provider.approvalStatus === activeFilter;

            const matchesSearch =
                !query ||
                provider.businessName?.toLowerCase().includes(query) ||
                provider.providerInfo?.name?.toLowerCase().includes(query) ||
                provider.providerInfo?.email?.toLowerCase().includes(query) ||
                provider.serviceCategory?.toLowerCase().includes(query) ||
                provider.businessLocation?.city?.toLowerCase().includes(query);

            return matchesStatus && matchesSearch;
        });
    }, [providers, activeFilter, search]);

    // Update provider status
    const handleStatusUpdate = async (
        provider: ProviderRequest,
        status: ProviderStatus,
        reason = ""
    ) => {
        try {
            setUpdatingId(provider._id);
            setActionError("");

            const updatedProvider = await updateProviderStatus(
                provider._id,
                status,
                reason
            );

            // Update provider in local state
            setProviders((previous) =>
                previous.map((item) =>
                    item._id === updatedProvider._id ? updatedProvider : item
                )
            );

            // Update selected provider if modal is open
            setSelectedProvider((previous) =>
                previous?._id === updatedProvider._id
                    ? updatedProvider
                    : previous
            );

            setRejectProvider(null);
            setRejectionReason("");
        } catch (err: any) {
            setActionError(
                err.response?.data?.message ||
                err.message ||
                "Unable to update provider status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // Confirm rejection
    const confirmRejection = async () => {
        if (!rejectProvider) return;

        if (!rejectionReason.trim()) {
            setActionError("Please enter a rejection reason.");
            return;
        }

        await handleStatusUpdate(
            rejectProvider,
            "rejected",
            rejectionReason.trim()
        );
    };

    // Status badge
    const renderStatus = (status: ProviderStatus) => {
        const icons = {
            pending: <Clock size={13} />,
            approved: <CheckCircle2 size={13} />,
            rejected: <XCircle size={13} />,
        };

        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}
            >
                {icons[status]}
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-7">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="mb-2 text-sm font-medium text-teal-700">
                            Admin Dashboard / Providers
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                            Provider Requests
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Review provider registrations and manage their approval status.
                        </p>
                    </div>

                    <button
                        onClick={fetchProviders}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                        {
                            label: "Total Requests",
                            value: counts.all,
                            icon: <BriefcaseBusiness size={19} />,
                            color: "text-blue-600 bg-blue-50",
                        },
                        {
                            label: "Pending",
                            value: counts.pending,
                            icon: <Clock size={19} />,
                            color: "text-amber-600 bg-amber-50",
                        },
                        {
                            label: "Approved",
                            value: counts.approved,
                            icon: <CheckCircle2 size={19} />,
                            color: "text-emerald-600 bg-emerald-50",
                        },
                        {
                            label: "Rejected",
                            value: counts.rejected,
                            icon: <XCircle size={19} />,
                            color: "text-red-600 bg-red-50",
                        },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-medium text-gray-500 sm:text-sm">
                                    {item.label}
                                </p>

                                <div className={`rounded-xl p-2 ${item.color}`}>
                                    {item.icon}
                                </div>
                            </div>

                            <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
                                {item.value}
                            </h2>
                        </div>
                    ))}
                </div>

                {/* Search and Filters */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-sm">
                            <Search
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                placeholder="Search name, email, category..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {filters.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setActiveFilter(filter.value)}
                                    className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeFilter === filter.value
                                        ? "bg-teal-700 text-white shadow-sm"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    {filter.label}
                                    <span className="ml-2 opacity-80">
                                        {counts[filter.value]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Error */}
                {(error || actionError) && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />

                        <div className="flex-1">{error || actionError}</div>

                        <button
                            onClick={() => {
                                setError("");
                                setActionError("");
                            }}
                            className="shrink-0"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                {/* Provider Requests */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">
                            {activeFilter === "all"
                                ? "All Providers"
                                : `${activeFilter.charAt(0).toUpperCase()}${activeFilter.slice(1)} Providers`}
                        </h2>

                        <span className="text-sm text-gray-500">
                            {filteredProviders.length} results
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white">
                            <Loader2 size={32} className="animate-spin text-teal-700" />

                            <p className="mt-3 text-sm text-gray-500">
                                Loading provider requests...
                            </p>
                        </div>
                    ) : filteredProviders.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-5 text-center">
                            <div className="rounded-2xl bg-gray-100 p-4">
                                <BriefcaseBusiness size={28} className="text-gray-400" />
                            </div>

                            <h3 className="mt-4 font-semibold text-gray-800">
                                No provider requests found
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Try changing the filter or search keyword.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            {filteredProviders.map((provider) => {
                                const user = provider.providerInfo;

                                return (
                                    <div
                                        key={provider._id}
                                        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                                    >
                                        <div className="p-5 sm:p-6">
                                            {/* Provider identity */}
                                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    {user?.image ? (
                                                        <img
                                                            src={user.image}
                                                            alt={user.name}
                                                            className="h-14 w-14 shrink-0 rounded-2xl border border-gray-100 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                                                            <UserRound size={25} />
                                                        </div>
                                                    )}

                                                    <div className="min-w-0">
                                                        <h3 className="truncate text-base font-bold text-gray-900">
                                                            {user?.name || "Unknown Provider"}
                                                        </h3>

                                                        <p className="mt-1 flex items-center gap-1.5 break-all text-xs text-gray-500">
                                                            <Mail size={13} className="shrink-0" />
                                                            {user?.email || "Email unavailable"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
                                                    {renderStatus(provider.approvalStatus)}

                                                    <span className="text-xs text-gray-400">
                                                        {formatDate(provider.createdAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="my-5 border-t border-gray-100" />

                                            {/* Business details */}
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900">
                                                    {provider.businessName}
                                                </h4>

                                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500">
                                                    {provider.description}
                                                </p>
                                            </div>

                                            <div className="mt-5 grid grid-cols-2 gap-3">
                                                <div className="rounded-xl bg-gray-50 p-3">
                                                    <p className="text-xs text-gray-500">Category</p>
                                                    <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                                                        {provider.serviceCategory}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-gray-50 p-3">
                                                    <p className="text-xs text-gray-500">Experience</p>
                                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                                        {provider.experience} years
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-gray-50 p-3">
                                                    <p className="text-xs text-gray-500">Charges</p>
                                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                                        PKR {provider.serviceCharges.toLocaleString()}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-gray-50 p-3">
                                                    <p className="text-xs text-gray-500">Location</p>
                                                    <p className="mt-1 flex items-center gap-1 truncate text-sm font-semibold text-gray-800">
                                                        <MapPin size={13} className="shrink-0" />
                                                        {provider.businessLocation?.city || "Not specified"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Rejection reason */}
                                            {provider.approvalStatus === "rejected" &&
                                                provider.rejectionReason && (
                                                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                                                        <p className="text-xs font-semibold text-red-700">
                                                            Rejection Reason
                                                        </p>

                                                        <p className="mt-1 text-sm text-red-600">
                                                            {provider.rejectionReason}
                                                        </p>
                                                    </div>
                                                )}

                                            {/* Actions */}
                                            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                                                <button
                                                    onClick={() => {
                                                        setSelectedProvider(provider);
                                                        setActionError("");
                                                    }}
                                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                                >
                                                    <Eye size={16} />
                                                    View Details
                                                </button>

                                                {provider.approvalStatus !== "approved" && (
                                                    <button
                                                        onClick={() =>
                                                            handleStatusUpdate(provider, "approved")
                                                        }
                                                        disabled={updatingId === provider._id}
                                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {updatingId === provider._id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 size={16} />
                                                        )}
                                                        Approve
                                                    </button>
                                                )}

                                                {provider.approvalStatus !== "rejected" && (
                                                    <button
                                                        onClick={() => {
                                                            setRejectProvider(provider);
                                                            setRejectionReason("");
                                                            setActionError("");
                                                        }}
                                                        disabled={updatingId === provider._id}
                                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                                                    >
                                                        <XCircle size={16} />
                                                        Reject
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Provider Details Modal */}
            {selectedProvider && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5"
                    onClick={() => setSelectedProvider(null)}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-5">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Provider Details
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Complete registration information
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedProvider(null)}
                                className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="space-y-6 p-5">
                            <div className="flex items-center gap-4">
                                {selectedProvider.providerInfo?.image ? (
                                    <img
                                        src={selectedProvider.providerInfo.image}
                                        alt=""
                                        className="h-16 w-16 rounded-2xl object-cover"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                                        <UserRound size={28} />
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {selectedProvider.providerInfo?.name || "Unknown Provider"}
                                    </h3>

                                    <p className="break-all text-sm text-gray-500">
                                        {selectedProvider.providerInfo?.email}
                                    </p>

                                    <div className="mt-2">
                                        {renderStatus(selectedProvider.approvalStatus)}
                                    </div>
                                </div>
                            </div>

                            {/* Business Information */}
                            <section>
                                <h3 className="mb-3 font-bold text-gray-900">
                                    Business Information
                                </h3>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {[
                                        ["Business Name", selectedProvider.businessName],
                                        ["Category", selectedProvider.serviceCategory],
                                        ["Experience", `${selectedProvider.experience} years`],
                                        [
                                            "Service Charges",
                                            `PKR ${selectedProvider.serviceCharges.toLocaleString()}`,
                                        ],
                                        [
                                            "Address",
                                            selectedProvider.businessLocation?.address,
                                        ],
                                        ["City", selectedProvider.businessLocation?.city],
                                        [
                                            "State",
                                            selectedProvider.businessLocation?.state || "Not provided",
                                        ],
                                        [
                                            "Country",
                                            selectedProvider.businessLocation?.country || "Not provided",
                                        ],
                                        [
                                            "Postal Code",
                                            selectedProvider.businessLocation?.postalCode || "Not provided",
                                        ],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="rounded-xl bg-gray-50 p-3"
                                        >
                                            <p className="text-xs text-gray-500">{label}</p>
                                            <p className="mt-1 wrap-break-word text-sm font-semibold text-gray-800">
                                                {value || "Not provided"}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3 rounded-xl bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Description</p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                                        {selectedProvider.description}
                                    </p>
                                </div>
                            </section>

                            {/* Working Hours */}
                            <section>
                                <h3 className="mb-3 font-bold text-gray-900">
                                    <CalendarDays size={17} className="mr-2 inline" />
                                    Working Hours
                                </h3>

                                <div className="space-y-2">
                                    {selectedProvider.workingHours?.map((hour) => (
                                        <div
                                            key={hour.day}
                                            className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3"
                                        >
                                            <span className="text-sm font-semibold text-gray-700">
                                                {hour.day}
                                            </span>

                                            <span
                                                className={`text-sm font-medium ${hour.isClosed
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
                            </section>

                            {/* Rejection Reason */}
                            {selectedProvider.rejectionReason && (
                                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                                    <p className="text-sm font-semibold text-red-700">
                                        Rejection Reason
                                    </p>

                                    <p className="mt-1 text-sm text-red-600">
                                        {selectedProvider.rejectionReason}
                                    </p>
                                </div>
                            )}

                            <p className="text-xs text-gray-400">
                                Registered on: {formatDate(selectedProvider.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {rejectProvider && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => {
                        setRejectProvider(null);
                        setActionError("");
                    }}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">
                                Reject Provider
                            </h2>

                            <button
                                onClick={() => setRejectProvider(null)}
                                className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                            Please provide a reason for rejecting{" "}
                            <span className="font-semibold text-gray-800">
                                {rejectProvider.businessName}
                            </span>
                            .
                        </p>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                            placeholder="Enter rejection reason..."
                            className="mt-5 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        />

                        {actionError && (
                            <p className="mt-2 text-sm text-red-600">{actionError}</p>
                        )}

                        <div className="mt-5 flex gap-3">
                            <button
                                onClick={() => {
                                    setRejectProvider(null);
                                    setActionError("");
                                }}
                                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmRejection}
                                disabled={
                                    !rejectionReason.trim() ||
                                    updatingId === rejectProvider._id
                                }
                                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {updatingId === rejectProvider._id ? (
                                    <Loader2 size={17} className="mx-auto animate-spin" />
                                ) : (
                                    "Confirm Reject"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Request;