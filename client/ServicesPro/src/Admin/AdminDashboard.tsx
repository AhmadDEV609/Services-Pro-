import { Link } from "react-router-dom";
import AdminNavbar from "./AdminNavbar.tsx";

/* ---------- Types ---------- */
interface Stat {
    id: string;
    value: string;
    label: string;
}

interface QueueItem {
    id: string;
    title: string;
    to: string;
}

/* ---------- Mock data (API se replace kar lein) ---------- */
const stats: Stat[] = [
    { id: "users", value: "1,240", label: "Users" },
    { id: "providers", value: "93", label: "Providers" },
    { id: "pending", value: "12", label: "Pending" },
    { id: "bookings", value: "420", label: "Bookings" },
];

const reviewQueue: QueueItem[] = [
    { id: "q1", title: "Provider verification", to: "/admin/providers/pending" },
    { id: "q2", title: "Reported review", to: "/admin/reviews/reported" },
    { id: "q3", title: "Flagged listing", to: "/admin/listings/flagged" },
];

/* ---------- Page ---------- */
export default function AdminDashboard() {
    return (
        <div className="flex min-h-dvh w-full bg-[#f8faf8] text-left text-[#37261f]">
            <AdminNavbar />

            <div className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
                <div className="mx-auto w-full max-w-md md:max-w-3xl lg:max-w-5xl">
                    {/* Header */}
                    <header className="rounded-2xl bg-[#e8f3f5] px-4 py-4 lg:px-6 lg:py-5">
                        <h1 className="text-lg font-bold lg:text-xl">Admin Dashboard</h1>
                    </header>

                    <main className="mt-6 space-y-6 lg:mt-8 lg:space-y-8">
                        {/* Stats */}
                        <section aria-label="Summary">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-5">
                                {stats.map((s) => (
                                    <div
                                        key={s.id}
                                        className="min-w-0 rounded-2xl bg-[#e8f3f5] px-4 py-7 sm:px-5 lg:px-6 lg:py-10"
                                    >
                                        <p className="text-3xl font-bold leading-none lg:text-4xl">{s.value}</p>
                                        <p className="mt-4 text-xs text-[#6b7a78] lg:text-sm">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Review queue */}
                        <section>
                            <h2 className="mb-3 px-1 text-sm font-bold lg:text-base">Review queue</h2>
                            <ul className="grid gap-3 md:grid-cols-3 lg:gap-5">
                                {reviewQueue.map((item) => (
                                    <li key={item.id}>
                                        <Link
                                            to={item.to}
                                            className="flex min-h-24 flex-col justify-between rounded-2xl border-2 border-[#dbe6e4] bg-[#f8faf8] p-4 transition-colors hover:border-[#5f8a85] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5f8a85] lg:min-h-32 lg:p-5"
                                        >
                                            <span className="text-sm font-bold">{item.title}</span>
                                            <span className="self-end text-xs text-[#3f7d6e]">View ›</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}