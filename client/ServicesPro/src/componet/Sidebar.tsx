
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    House,
    Compass,
    CalendarDays,
    UserRound,
    LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { logout } from "../axios/auth.api";

const Sidebar = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        { name: "ProviderDashboard", path: "/provider/dashboard", icon: UserRound },
        ...(user?.role === "user"
            ? [
                {
                    name: "Profile",
                    path: "/customer/profile",
                    icon: UserRound,
                },
            ]
            : [])
    ];

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
                                    `flex items-center gap-4 rounded-xl px-4 py-4 text-left transition-all ${isActive
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

                {/* DESKTOP LOGOUT */}
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mt-4 flex items-center gap-4 rounded-xl px-4 py-4 text-left text-red-500 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <LogOut size={21} />
                    <span>
                        {isLoggingOut ? "Logging out..." : "Logout"}
                    </span>
                </button>

                <div className="mt-auto rounded-2xl bg-[#E8F3F5] p-5">
                    <p className="font-semibold">Need a service?</p>

                    <p className="mt-2 text-sm text-gray-500">
                        Find trusted professionals for your home.
                    </p>
                </div>
            </aside>

            {/* MOBILE BOTTOM NAVIGATION */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#F8F9F8] px-4 pb-2 pt-2 lg:hidden">

                <nav className="mx-auto flex h-17 max-w-150 items-center justify-around rounded-[22px] border-2 border-[#DFE7E5] bg-white shadow-sm">

                    {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex min-w-15 flex-col items-center justify-center gap-1 ${isActive
                                        ? "text-[#4E8975]"
                                        : "text-[#77716F]"
                                    }`
                                }
                            >
                                <Icon size={21} strokeWidth={1.6} />

                                <span className="text-[11px]">
                                    {item.name}
                                </span>
                            </NavLink>
                        );
                    })}

                    {/* MOBILE LOGOUT */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex min-w-15 flex-col items-center justify-center gap-1 text-red-500 disabled:opacity-50"
                    >
                        <LogOut size={21} strokeWidth={1.6} />

                        <span className="text-[11px]">
                            {isLoggingOut ? "Wait..." : "Logout"}
                        </span>
                    </button>

                </nav>
            </div>
        </>
    );
};

export default Sidebar;
