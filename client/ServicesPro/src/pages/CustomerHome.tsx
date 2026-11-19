import { useState } from "react";
import {
    Search,
    Sparkles,
    House,
    Settings,
    Wind,
    Paintbrush,
    Hammer,
    Compass,
    CalendarDays,
    UserRound,
    ArrowRight,
    Menu,
    X,
} from "lucide-react";
import Sidebar from "../componet/Sidebar";

const categories = [
    { id: 1, name: "Cleaning", icon: Sparkles },
    { id: 2, name: "Plumbing", icon: House },
    { id: 3, name: "Electric", icon: Settings },
    { id: 4, name: "AC Repair", icon: Wind },
    { id: 5, name: "Painting", icon: Paintbrush },
    { id: 6, name: "Carpentry", icon: Hammer },
];

const navigation = [
    { name: "Home", icon: House },
    { name: "Explore", icon: Compass },
    { name: "Bookings", icon: CalendarDays },
    { name: "Profile", icon: UserRound },
];

const CustomerHome = () => {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("Home");
    const [menuOpen, setMenuOpen] = useState(false);

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleBooking = () => {
        if (!selectedCategory) {
            alert("Please select a service category first.");
            return;
        }


        console.log("Selected service:", selectedCategory);
    };

    return (
        <div className="min-h-screen bg-[#F8FAF9] font-sans text-[#342520]">

            <div className="mx-auto flex min-h-screen max-w-[1600px]">

                {/* SIDEBAR */}
                <Sidebar />

                {/* MAIN CONTENT */}
                <main className="min-w-0 flex-1 pb-28 lg:pb-10">

                    {/* MOBILE HEADER */}
                    <header className="px-5 pt-6 sm:px-8 lg:px-12 lg:pt-10">

                        <div className="mb-6 flex items-center justify-between lg:hidden">
                            <span className="text-sm font-bold">9:41</span>

                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                aria-label="Toggle menu"
                                className="rounded-lg p-2"
                            >
                                {menuOpen ? <X size={23} /> : <Menu size={23} />}
                            </button>
                        </div>

                        {menuOpen && (
                            <div className="mb-5 rounded-xl bg-white p-3 shadow-sm lg:hidden">
                                {navigation.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => {
                                            setActiveTab(item.name);
                                            setMenuOpen(false);
                                        }}
                                        className="block w-full rounded-lg px-4 py-3 text-left hover:bg-[#E8F3F5]"
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="rounded-[18px] bg-[#E8F3F5] px-4 py-4 lg:px-7 lg:py-6">
                            <h1 className="text-[22px] font-bold lg:text-3xl">
                                Customer Home
                            </h1>
                            <p className="mt-2 hidden text-sm text-gray-500 lg:block">
                                Find reliable services for your home.
                            </p>
                        </div>
                    </header>

                    <div className="mx-auto max-w-300 px-5 sm:px-8 lg:px-12">

                        {/* SEARCH */}
                        <div className="relative mt-7 lg:mt-9">
                            <Search
                                size={19}
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-[#888]"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search services, city..."
                                className="h-13.75 w-full rounded-[17px] border-2 border-[#DFE7E5] bg-white pl-12 pr-5 text-[14px] outline-none transition focus:border-[#57877E] lg:h-15.5"
                            />
                        </div>

                        {/* HERO BANNER */}
                        <section className="relative mt-6 flex min-h-44 overflow-hidden rounded-[23px] bg-[#34241F] p-5 text-white sm:p-7 lg:min-h-65 lg:p-10">

                            <div className="relative z-10 flex w-[60%] flex-col items-start justify-between">

                                <h2 className="max-w-57.5 text-[21px] font-normal leading-[1.45] sm:text-2xl lg:max-w-md lg:text-4xl">
                                    Your home. In safe hands.
                                </h2>

                                <button
                                    onClick={handleBooking}
                                    className="mt-7 flex h-9.25 w-37.5 items-center justify-center gap-2 rounded-full bg-[#E8F3F5] text-[13px] font-bold text-[#34241F] transition hover:bg-white lg:h-12 lg:w-45"
                                >
                                    Book now
                                    <ArrowRight size={16} className="hidden lg:block" />
                                </button>
                            </div>

                            {/* HERO DECORATION */}
                            <div className="absolute bottom-5 right-2 top-5 flex w-28.25 flex-col justify-center gap-3 rounded-[18px] bg-[#5A8886] px-3.5 sm:right-6 sm:w-36.25 lg:bottom-8 lg:right-12 lg:top-8 lg:w-52.5 lg:px-7">

                                <div className="h-4.5 rounded-[5px] bg-[#D3E9E9] lg:h-6.75" />
                                <div className="h-4.5 rounded-[5px] bg-[#D3E9E9] lg:h-6.75" />
                                <div className="h-4.5 rounded-[5px] bg-[#D3E9E9] lg:h-6.75" />

                            </div>
                        </section>

                        {/* CATEGORIES */}
                        <section className="mt-6 lg:mt-10">

                            <div className="mb-5 flex items-center justify-between px-2">
                                <h2 className="text-[17px] font-bold lg:text-2xl">
                                    Popular categories
                                </h2>

                                <span className="hidden text-sm text-[#57877E] lg:block">
                                    Select a service
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-3">

                                {filteredCategories.map((category) => {
                                    const Icon = category.icon;
                                    const isSelected = selectedCategory === category.name;

                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.name)}
                                            className={`flex h-25 min-w-0 flex-col items-start justify-between rounded-[17px] border-2 p-2.75 text-left transition-all sm:h-33.75 sm:p-5 lg:h-38.75 lg:p-6 ${isSelected
                                                ? "border-[#57877E] bg-[#DCEDEB]"
                                                : "border-transparent bg-[#E8F3F5] hover:border-[#9CBDB7]"
                                                }`}
                                        >
                                            <div className="flex w-full flex-1 items-center justify-center">
                                                <Icon
                                                    size={22}
                                                    strokeWidth={1.8}
                                                    className="text-[#4E8975] sm:h-7 sm:w-7 lg:h-9 lg:w-9"
                                                />
                                            </div>

                                            <span className="w-full truncate text-[11px] font-medium sm:text-sm lg:text-base">
                                                {category.name}
                                            </span>
                                        </button>
                                    );
                                })}

                            </div>

                            {filteredCategories.length === 0 && (
                                <p className="py-10 text-center text-sm text-gray-500">
                                    No services found.
                                </p>
                            )}
                        </section>

                        {/* CONTINUE BUTTON */}
                        <div className="mt-0 px-1 lg:mt-8 lg:px-0">
                            <button
                                onClick={handleBooking}
                                className="flex h-12.75 w-full items-center justify-between rounded-[17px] bg-[#34241F] px-5 text-left text-[17px] font-bold text-white transition hover:bg-[#49342C] lg:h-15 lg:px-7"
                            >
                                Continue / Book
                                <ArrowRight size={21} className="hidden lg:block" />
                            </button>
                        </div>

                    </div>
                </main>
            </div>

            {/* MOBILE BOTTOM NAVIGATION */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#F8FAF9] px-4 pb-2 pt-2 lg:hidden">

                <nav className="mx-auto flex h-17.25 max-w-150 items-center justify-around rounded-[22px] border-2 border-[#DFE7E5] bg-white shadow-sm">

                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.name;

                        return (
                            <button
                                key={item.name}
                                onClick={() => setActiveTab(item.name)}
                                className="flex min-w-15 flex-col items-center justify-center gap-1.25"
                            >
                                <Icon
                                    size={21}
                                    strokeWidth={1.6}
                                    className={
                                        isActive ? "text-[#4E8975]" : "text-[#77716F]"
                                    }
                                />

                                <span className="text-[11px] text-[#342520]">
                                    {item.name}
                                </span>
                            </button>
                        );
                    })}

                </nav>
            </div>

        </div>
    );
};

export default CustomerHome;