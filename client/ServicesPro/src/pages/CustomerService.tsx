
import { useState } from "react";
import {
    Search, Sparkles, House, Settings, Wind,
    Hammer, Paintbrush, Bug, Wrench, ChevronRight,
    Compass, CalendarDays, UserRound,
    type LucideIcon,
} from "lucide-react";

type Category = {
    name: string;
    icon: LucideIcon;
};

const popularCategories: Category[] = [
    { name: "Cleaners", icon: Sparkles },
    { name: "Plumbers", icon: House },
    { name: "Electricians", icon: Settings },
    { name: "AC Repair", icon: Wind },
    { name: "Carpenters", icon: Hammer },
    { name: "Painters", icon: Paintbrush },
];

const moreCategories: Category[] = [
    { name: "Pest control", icon: Bug },
    { name: "Appliance repair", icon: Wrench },
];

const navigation = [
    { name: "Home", icon: House },
    { name: "Explore", icon: Compass },
    { name: "Bookings", icon: CalendarDays },
    { name: "Profile", icon: UserRound },
];

const CustomerService = () => {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("Explore");

    const matches = (name: string) =>
        name.toLowerCase().includes(search.trim().toLowerCase());

    const popular = popularCategories.filter((item) => matches(item.name));
    const more = moreCategories.filter((item) => matches(item.name));

    const handleCategory = (name: string) => {
        setSelected(name);
        // Connect your service listing route here.
    };

    return (
        <div className="min-h-screen bg-[#F8FAF9] font-sans text-[#34241F]">
            <div className="mx-auto flex min-h-screen max-w-[1600px]">

                {/* Desktop Sidebar */}
                <aside className="hidden w-65 shrink-0 flex-col border-r border-[#DFE7E5] bg-white p-6 lg:flex">
                    <div className="mb-12 flex items-center gap-3 text-xl font-bold">
                        <span className="rounded-xl bg-[#E8F3F5] p-3 text-[#4E8975]">
                            <House size={22} />
                        </span>
                        Services <span className="text-[#4E8975]">Pro</span>.
                    </div>

                    <nav className="space-y-2">
                        {navigation.map(({ name, icon: Icon }) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => setActiveTab(name)}
                                className={`flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left transition ${activeTab === name
                                    ? "bg-[#E8F3F5] font-semibold text-[#4E8975]"
                                    : "text-[#716D6B] hover:bg-[#F3F7F6]"
                                    }`}
                            >
                                <Icon size={21} strokeWidth={1.8} />
                                {name}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto rounded-2xl bg-[#E8F3F5] p-5">
                        <p className="font-semibold">Explore services</p>
                        <p className="mt-2 text-sm leading-6 text-[#667672]">
                            Find the right professional for your home.
                        </p>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="min-w-0 flex-1 px-5 pb-28 pt-6 sm:px-8 lg:px-12 lg:pb-12 lg:pt-10">
                    <div className="mx-auto max-w-262.5">

                        {/* Mobile Status */}
                        <div className="mb-2.5 flex h-7 items-center px-3 lg:hidden">
                            <span className="text-[14px] font-bold">9:41</span>
                        </div>

                        {/* Header */}
                        <header className="rounded-[18px] bg-[#E8F3F5] px-4 py-3.75 lg:px-7 lg:py-7">
                            <h1 className="text-[22px] font-bold leading-6.5 lg:text-3xl">
                                Service Categories
                            </h1>
                            <p className="mt-2 hidden text-sm text-[#667672] lg:block">
                                Browse and choose a service for your home.
                            </p>
                        </header>

                        {/* Search */}
                        <div className="relative mt-7 lg:mt-9">
                            <Search
                                size={17}
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-[#898583]"
                            />

                            <input
                                type="search"
                                aria-label="Search services"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search services, city..."
                                className="h-13.75 w-full rounded-[17px] border-2 border-[#DFE7E5] bg-white pl-10 pr-4 text-[13px] outline-none placeholder:text-[#77716F] focus:border-[#57877E] focus:ring-2 focus:ring-[#57877E]/15 lg:h-15 lg:text-sm"
                            />
                        </div>

                        {/* Popular Categories */}
                        <section className="mt-5.75 lg:mt-10">
                            <h2 className="mb-5 px-2 text-[17px] font-bold lg:text-2xl">
                                Popular categories
                            </h2>

                            <div className="grid grid-cols-3 gap-1.5 sm:gap-4 xl:gap-5">
                                {popular.map(({ name, icon: Icon }) => (
                                    <button
                                        type="button"
                                        key={name}
                                        onClick={() => handleCategory(name)}
                                        aria-pressed={selected === name}
                                        className={`flex h-25 min-w-0 flex-col items-start justify-between rounded-[17px] border-2 p-2.5 text-left transition sm:h-33.75 sm:p-5 lg:h-38.75 lg:p-6 ${selected === name
                                            ? "border-[#57877E] bg-[#DDEEEB]"
                                            : "border-transparent bg-[#E8F3F5] hover:border-[#9CBDB7]"
                                            }`}
                                    >
                                        <span className="flex w-full flex-1 items-center justify-center">
                                            <Icon
                                                size={21}
                                                strokeWidth={1.8}
                                                className="text-[#4E8975] sm:h-7 sm:w-7 lg:h-9 lg:w-9"
                                            />
                                        </span>
                                        <span className="w-full truncate text-[11px] sm:text-sm lg:text-base">
                                            {name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* More Categories */}
                        <section className="mt-6.75 lg:mt-11">
                            <h2 className="mb-5.75 px-2 text-[17px] font-bold lg:text-2xl">
                                More categories
                            </h2>

                            <div className="grid gap-3 lg:grid-cols-2 lg:gap-5">
                                {more.map(({ name, icon: Icon }) => (
                                    <button
                                        type="button"
                                        key={name}
                                        onClick={() => handleCategory(name)}
                                        className={`flex min-h-19 items-center justify-between rounded-2xl border-2 bg-white px-5 py-4 text-left transition lg:min-h-27.5 lg:px-6 ${selected === name
                                            ? "border-[#57877E]"
                                            : "border-[#DFE7E5] hover:border-[#9CBDB7]"
                                            }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Icon size={23} className="hidden text-[#4E8975] lg:block" />
                                            <span className="text-[14px] font-bold lg:text-base">
                                                {name}
                                            </span>
                                        </span>

                                        <span className="flex items-center gap-2 self-end text-[13px] text-[#57877E] lg:self-center">
                                            View <ChevronRight size={13} />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {popular.length === 0 && more.length === 0 && (
                            <p className="mt-8 text-center text-sm text-[#756D69]">
                                No matching services found.
                            </p>
                        )}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="fixed inset-x-0 bottom-0 z-40 bg-[#F8FAF9] px-4 pb-2 pt-2 lg:hidden">
                <nav className="mx-auto flex h-17.25 max-w-150 items-center justify-around rounded-[22px] border-2 border-[#DFE7E5] bg-white">
                    {navigation.map(({ name, icon: Icon }) => (
                        <button
                            type="button"
                            key={name}
                            onClick={() => setActiveTab(name)}
                            className="flex min-w-15 flex-col items-center justify-center gap-1.25"
                        >
                            <Icon
                                size={21}
                                strokeWidth={1.6}
                                className={
                                    activeTab === name
                                        ? "text-[#4E8975]"
                                        : "text-[#77716F]"
                                }
                            />
                            <span className="text-[11px]">{name}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default CustomerService;
