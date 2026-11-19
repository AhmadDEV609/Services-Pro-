import { NavLink } from "react-router-dom";

interface NavItem {
    to: string;
    label: string;
    icon: string;
}

const navItems: NavItem[] = [
    { to: "/provider/dashboard", label: "Home", icon: "⌂" },
    { to: "/provider/booking", label: "Bookings", icon: "▣" },
    { to: "/provider/profile", label: "Profile", icon: "○" },
];

/**
 * Mobile / tablet: neeche floating pill nav
 * Desktop (lg+): left sticky sidebar
 *
 * Isay page ke us flex wrapper ke andar sabse pehle rakhein jo
 * `flex min-h-dvh` hai, taake sidebar content ke saath side by side aaye.
 */
export default function ProviderNavbar() {
    return (
        <>
            {/* Desktop: sticky sidebar */}
            <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r-2 border-[#dbe6e4] bg-[#f8faf8] p-6 lg:flex">
                <p className="mb-8 rounded-2xl bg-[#e8f3f5] px-4 py-3 text-sm font-bold">Provider Panel</p>
                <nav aria-label="Provider navigation" className="flex flex-col gap-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${isActive ? "bg-[#e8f3f5] text-[#3f7d6e]" : "text-[#37261f]/70 hover:bg-[#e8f3f5]/60"
                                }`
                            }
                        >
                            <span aria-hidden className="text-lg leading-none">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Mobile / tablet: floating pill nav */}
            <nav
                aria-label="Provider navigation"
                className="fixed inset-x-0 bottom-3 z-20 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center justify-around rounded-full border-2 border-[#dbe6e4] bg-[#f8faf8] px-4 py-3 lg:hidden"
            >
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 text-[11px] font-medium ${isActive ? "text-[#3f7d6e]" : "text-[#37261f]/70"
                            }`
                        }
                    >
                        <span aria-hidden className="text-xl leading-none">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </>
    );
}