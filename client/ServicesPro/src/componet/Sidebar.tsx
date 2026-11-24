
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    House,
    Compass,
    CalendarDays,
    UserRound,
    LogOut,
    ChevronUp,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { logout } from "../axios/auth.api";

const Sidebar = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);

            await logout();
            setUser(null);

            navigate("/login", { replace: true });

        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const navigation = [
        { name: "Home", path: "/", icon: House, end: true },
        { name: "Explore", path: "/customer/explore", icon: Compass },
        { name: "Bookings", path: "/customer/booking", icon: CalendarDays },
        ...(user?.role === "provider"
            ? [
                {
                    name: "Dashboard",
                    path: "/provider/dashboard",
                    icon: UserRound,
                },
            ]
            : []),
    ];

    const userName = user?.name || "My Account";

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden w-65 shrink-0 flex-col border-r border-[#E1E8E7] bg-white p-6 lg:flex">

                <h1 className="mb-12 text-2xl font-bold">
                    Services<span className="text-[#57877E]">Pro</span>
                </h1>

                <nav className="flex flex-col gap-3">
                    {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-4 rounded-xl px-4 py-4 transition-all ${isActive
                                        ? "bg-[#E8F3F5] font-semibold text-[#457F70]"
                                        : "text-[#716D6B] hover:bg-gray-100"
                                    }`
                                }
                            >
                                <Icon size={21} />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* DESKTOP USER PROFILE DROPDOWN */}
                <div className="relative mt-4 group">

                    <button
                        type="button"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex w-full items-center gap-3 rounded-xl border border-[#E1E8E7] p-3 text-left hover:bg-gray-50"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F3F5] text-[#457F70]">
                            <UserRound size={21} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-800">
                                {userName}
                            </p>
                            <p className="text-xs text-gray-500">
                                My Account
                            </p>
                        </div>

                        <ChevronUp size={18} className="text-gray-500 transition-transform group-hover:rotate-180" />
                    </button>

                    <div className="absolute bottom-full left-0 mb-2 hidden w-full rounded-xl border border-gray-100 bg-white p-3 shadow-xl group-hover:block group-focus-within:block">

                        <p className="mb-3 truncate px-2 text-sm font-medium text-gray-700">
                            {userName}
                        </p>

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50"
                        >
                            <LogOut size={18} />
                            {isLoggingOut ? "Logging out..." : "Logout"}
                        </button>

                    </div>
                </div>

                <div className="mt-auto rounded-2xl bg-[#E8F3F5] p-5">
                    <p className="font-semibold">Need a service?</p>

                    <p className="mt-2 text-sm text-gray-500">
                        Find trusted professionals for your home.
                    </p>
                </div>
            </aside>

            {/* MOBILE BOTTOM NAVIGATION */}
            <div className="fixed inset-x-0 bottom-0 z-[9999] bg-[#F8F9F8] px-2 pb-2 pt-2 lg:hidden">

                <nav className="relative mx-auto flex h-16 w-full max-w-150 items-center justify-around rounded-[22px] border-2 border-[#DFE7E5] bg-white shadow-lg">

                    {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex h-full flex-1 min-w-0 flex-col items-center justify-center gap-1 ${isActive
                                        ? "text-[#4E8975] font-semibold"
                                        : "text-[#77716F]"
                                    }`
                                }
                            >
                                <Icon size={21} strokeWidth={1.8} />

                                <span className="whitespace-nowrap text-[10px]">
                                    {item.name}
                                </span>
                            </NavLink>
                        );
                    })}

                    {/* MOBILE PROFILE DROPDOWN */}
                    <div className="relative flex h-full flex-1 items-center justify-center">

                        {isProfileOpen && (
                            <div className="absolute bottom-full right-0 mb-3 w-48 rounded-xl border border-gray-100 bg-white p-3 shadow-xl">

                                <p className="mb-3 truncate px-2 text-sm font-semibold text-gray-800">
                                    {userName}
                                </p>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50"
                                >
                                    <LogOut size={18} />
                                    {isLoggingOut ? "Wait..." : "Logout"}
                                </button>

                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`flex h-full w-full flex-col items-center justify-center gap-1 ${isProfileOpen
                                ? "text-[#4E8975]"
                                : "text-[#77716F]"
                                }`}
                        >
                            <UserRound size={21} strokeWidth={1.8} />

                            <span className="text-[10px]">
                                Account
                            </span>
                        </button>

                    </div>

                </nav>
            </div>
        </>
    );
};

export default Sidebar;
