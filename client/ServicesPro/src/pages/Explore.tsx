
import { useEffect, useState } from "react";
import {
    Search,
    MapPin,
    BriefcaseBusiness,
    ArrowRight,
    LoaderCircle,
    Users,
    SlidersHorizontal,
    X,
    UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
    getApprovedProviders,
    type ProviderProfile,
} from "../axios/provider.api.tsx";

const categories = [
    "All",
    "Electrician",
    "Plumber",
    "Cleaner",
    "Painter",
    "Carpenter",
];

const Explore = () => {
    const navigate = useNavigate();

    const [providers, setProviders] = useState<ProviderProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch approved providers
    const fetchProviders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getApprovedProviders({
                page,
                limit: 12,
                search,
                category: category === "All" ? "" : category,
            });

            setProviders(response.providers);
            setTotal(response.total);
            setTotalPages(response.totalPages);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Something went wrong while loading providers."
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch when search, category or page changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProviders();
        }, 400);

        return () => clearTimeout(timer);
    }, [search, category, page]);

    // Change category
    const handleCategoryChange = (value: string) => {
        setCategory(value);
        setPage(1);
    };

    // Search input
    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    // Navigate to provider profile
    const handleViewProfile = (providerId: string) => {
        navigate(`/customer/provider/${providerId}`);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">

            {/* Main Container */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

                {/* Header */}
                <div className="mb-8 sm:mb-10">

                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
                        <Users size={16} />
                        Discover Professionals
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                        Explore Services
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                        Find trusted professionals for your home and
                        everyday needs. Explore services and connect
                        with the right expert.
                    </p>

                </div>

                {/* Search Section */}
                <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">

                    <div className="flex flex-col gap-4 md:flex-row">

                        {/* Search Input */}
                        <div className="relative flex-1">

                            <Search
                                size={20}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search by provider or business name..."
                                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-11 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => handleSearch("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                    aria-label="Clear search"
                                >
                                    <X size={18} />
                                </button>
                            )}

                        </div>

                        {/* Search Button */}
                        <button
                            type="button"
                            onClick={fetchProviders}
                            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-600 px-7 text-sm font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98]"
                        >
                            <Search size={18} />
                            Search
                        </button>

                    </div>

                </div>

                {/* Categories */}
                <div className="mb-8">

                    <div className="mb-4 flex items-center gap-2">
                        <SlidersHorizontal
                            size={18}
                            className="text-gray-600"
                        />

                        <h2 className="text-base font-bold text-gray-900">
                            Browse Categories
                        </h2>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-3">

                        {categories.map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => handleCategoryChange(item)}
                                className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${category === item
                                    ? "border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-600/20"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-teal-500 hover:text-teal-700"
                                    }`}
                            >
                                {item}
                            </button>
                        ))}

                    </div>

                </div>

                {/* Providers Heading */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                            Available Professionals
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Find the right expert for your service.
                        </p>
                    </div>

                    {!loading && !error && (
                        <div className="rounded-lg bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
                            {total} {total === 1 ? "Provider" : "Providers"}
                        </div>
                    )}

                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex min-h-72 flex-col items-center justify-center">

                        <LoaderCircle
                            size={38}
                            className="animate-spin text-teal-600"
                        />

                        <p className="mt-4 text-sm font-medium text-gray-500">
                            Finding available professionals...
                        </p>

                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="rounded-2xl border border-red-100 bg-white px-5 py-12 text-center">

                        <p className="font-semibold text-red-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchProviders}
                            className="mt-5 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700"
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && providers.length === 0 && (
                    <div className="rounded-2xl border border-gray-100 bg-white px-5 py-16 text-center shadow-sm">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                            <Search
                                size={28}
                                className="text-teal-600"
                            />
                        </div>

                        <h3 className="mt-5 text-xl font-bold text-gray-900">
                            No Providers Found
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                            We couldn't find any approved providers
                            matching your search. Try another name or category.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setCategory("All");
                                setPage(1);
                            }}
                            className="mt-6 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                        >
                            Clear Filters
                        </button>

                    </div>
                )}

                {/* Provider Cards */}
                {!loading && !error && providers.length > 0 && (

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {providers.map((provider) => {

                            const user =
                                typeof provider.providerInfo === "object"
                                    ? provider.providerInfo
                                    : null;

                            return (
                                <div
                                    key={provider._id}
                                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-100 hover:shadow-xl hover:shadow-gray-200/60"
                                >

                                    {/* Card Top */}
                                    <div className="relative p-5 pb-4">

                                        <div className="flex items-start gap-4">

                                            {/* Profile Image */}
                                            <div className="h-17 w-17 shrink-0 overflow-hidden rounded-2xl bg-teal-50 ring-4 ring-teal-50/70">

                                                {user?.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt={user.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <UserRound
                                                            size={30}
                                                            className="text-teal-600"
                                                        />
                                                    </div>
                                                )}

                                            </div>

                                            {/* Provider Details */}
                                            <div className="min-w-0 flex-1 pt-1">

                                                <h3 className="truncate text-base font-bold text-gray-900">
                                                    {provider.businessName}
                                                </h3>

                                                <p className="mt-1 truncate text-sm text-gray-500">
                                                    {user?.name || "Professional Provider"}
                                                </p>

                                                <span className="mt-2 inline-block rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                                                    {provider.serviceCategory}
                                                </span>

                                            </div>

                                        </div>

                                        {/* Description */}
                                        <p className="mt-5 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
                                            {provider.description}
                                        </p>

                                    </div>

                                    {/* Card Divider */}
                                    <div className="border-t border-gray-100" />

                                    {/* Provider Information */}
                                    <div className="space-y-4 p-5">

                                        {/* Experience */}
                                        <div className="flex items-center gap-3">

                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                                                <BriefcaseBusiness
                                                    size={17}
                                                    className="text-blue-600"
                                                />
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Experience
                                                </p>

                                                <p className="text-sm font-semibold text-gray-800">
                                                    {provider.experience} Years
                                                </p>
                                            </div>

                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center gap-3">

                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
                                                <MapPin
                                                    size={17}
                                                    className="text-orange-600"
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-400">
                                                    Location
                                                </p>

                                                <p className="truncate text-sm font-semibold text-gray-800">
                                                    {provider.businessLocation.city}
                                                </p>
                                            </div>

                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center justify-between border-t border-gray-100 pt-4">

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Service Charges
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-teal-700">
                                                    Rs. {provider.serviceCharges.toLocaleString("en-PK")}
                                                </p>
                                            </div>

                                            <span className="text-xs text-gray-400">
                                                Starting price
                                            </span>

                                        </div>

                                        {/* View Profile Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleViewProfile(provider._id)}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white transition duration-200 hover:bg-teal-700 active:scale-[0.98]"
                                        >
                                            View Profile

                                            <ArrowRight
                                                size={17}
                                                className="transition-transform group-hover:translate-x-1"
                                            />
                                        </button>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-3">

                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((prev) => prev - 1)}
                            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-teal-500 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <span className="text-sm font-medium text-gray-600">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((prev) => prev + 1)}
                            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-teal-500 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>

                    </div>

                )}

            </div>

        </div>
    );
};

export default Explore;
