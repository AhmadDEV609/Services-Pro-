
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface NavItem {
    to: string;
    label: string;
    icon: string;
}

const navItems: NavItem[] = [
    { to: "/admin/dashboard", label: "Home", icon: "⌂" },
    { to: "/admin/request", label: "Requests", icon: "◎" },
];

export default function AdminNavbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r-2 border-[#dbe6e4] bg-[#f8faf8] p-6 lg:flex">

                <p className="mb-8 rounded-2xl bg-[#e8f3f5] px-4 py-3 text-sm font-bold">
                    Admin Panel
                </p>

                <nav aria-label="Admin navigation" className="flex flex-col gap-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${isActive
                                    ? "bg-[#e8f3f5] text-[#3f7d6e]"
                                    : "text-[#37261f]/70 hover:bg-[#e8f3f5]/60"
                                }`
                            }
                        >
                            <span aria-hidden className="text-lg leading-none">
                                {item.icon}
                            </span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {user && (
                    <button
                        onClick={handleLogout}
                        className="mt-auto w-full rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                        ↪ Logout
                    </button>
                )}
            </aside>

            {/* Mobile Navigation */}
            <nav
                aria-label="Admin navigation"
                className="fixed inset-x-0 bottom-3 z-20 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center justify-around rounded-full border-2 border-[#dbe6e4] bg-[#f8faf8] px-4 py-3 lg:hidden"
            >
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 text-[11px] font-medium ${isActive
                                ? "text-[#3f7d6e]"
                                : "text-[#37261f]/70"
                            }`
                        }
                    >
                        <span aria-hidden className="text-xl leading-none">
                            {item.icon}
                        </span>
                        {item.label}
                    </NavLink>
                ))}

                {user && (
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center gap-1 text-[11px] font-medium text-red-600"
                    >
                        <span className="text-xl leading-none">↪</span>
                        Logout
                    </button>
                )}
            </nav>
        </>
    );
}
