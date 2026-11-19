import { Link } from "react-router-dom";
import ProviderNavbar from "./ProviderNavbar.tsx";

/* ---------- Types ---------- */
interface ProviderInfo {
    businessName: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    avatarUrl?: string;
}

interface Stat {
    id: string;
    value: string;
    label: string;
}

/* ---------- Mock data (API se replace kar lein) ---------- */
const provider: ProviderInfo = {
    businessName: "Ahmed Home Services",
    rating: 4.8,
    reviewCount: 124,
    verified: true,
};

const stats: Stat[] = [
    { id: "leads", value: "12", label: "New leads" },
    { id: "bookings", value: "38", label: "Bookings" },
    { id: "rating", value: "4.9", label: "Rating" },
    { id: "revenue", value: "PKR 48k", label: "Revenue*" },
];

/* ---------- Page ---------- */
export default function ProviderDashboard() {
    return (
        <div className="flex min-h-dvh w-full bg-[#f8faf8] text-left text-[#37261f]">
            <ProviderNavbar />

            <div className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
                <div className="mx-auto w-full max-w-md md:max-w-3xl lg:max-w-5xl">
                    {/* Header */}
                    <header className="rounded-2xl bg-[#e8f3f5] px-4 py-4 lg:px-6 lg:py-5">
                        <h1 className="text-lg font-bold lg:text-xl">Provider Dashboard</h1>
                    </header>

                    <main className="mt-6 space-y-6 lg:mt-8 lg:space-y-8">
                        {/* Profile card */}
                        <section className="flex items-center gap-4 rounded-2xl bg-[#d3e7ea] p-4 sm:gap-5 lg:gap-8 lg:p-8">
                            {provider.avatarUrl ? (
                                <img
                                    src={provider.avatarUrl}
                                    alt={provider.businessName}
                                    className="size-24 shrink-0 rounded-2xl object-cover sm:size-28 lg:size-40"
                                />
                            ) : (
                                <div className="grid size-24 shrink-0 place-items-center rounded-2xl bg-[#5f8a85] text-4xl font-bold text-white sm:size-28 lg:size-40 lg:text-6xl">
                                    {provider.businessName.charAt(0)}
                                </div>
                            )}
                            <div className="min-w-0">
                                <h2 className="text-base font-bold leading-snug sm:text-lg lg:text-3xl">
                                    {provider.businessName}
                                </h2>
                                <p className="mt-2 text-xs font-bold text-[#3f7d6e] lg:mt-3 lg:text-base">
                                    ★★★★★ {provider.rating} ({provider.reviewCount})
                                </p>
                                {provider.verified && (
                                    <p className="mt-2 text-xs text-[#6b7a78] lg:mt-3 lg:text-base">Verified professional</p>
                                )}
                            </div>
                        </section>

                        {/* Stats */}
                        <section aria-label="Summary">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-5">
                                {stats.map((s) => (
                                    <div
                                        key={s.id}
                                        className="min-w-0 rounded-2xl bg-[#e8f3f5] px-4 py-6 sm:px-5 lg:px-6 lg:py-9"
                                    >
                                        <p className="text-2xl font-bold leading-none sm:text-3xl lg:text-4xl">{s.value}</p>
                                        <p className="mt-4 text-xs text-[#6b7a78] lg:text-sm">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 px-1 text-[11px] text-[#6b7a78]">*Is mahine ki revenue</p>
                        </section>

                        {/* Single action */}
                        <section>
                            <Link
                                to="/provider/profile"
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#37261f] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#4a352d] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5f8a85] lg:w-auto lg:min-w-64"
                            >
                                View profile
                                <span aria-hidden>›</span>
                            </Link>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}