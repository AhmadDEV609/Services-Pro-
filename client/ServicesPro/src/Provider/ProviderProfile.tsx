
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";
import ProviderNavbar from "./ProviderNavbar";

import {
    createProviderProfile,
    getMyProviderProfile,
    type ProviderProfile,
    type ProviderProfilePayload,
    type WorkingDay,
} from "../axios/provider.api";

// --------------------------------------------------
// Types
// --------------------------------------------------

type DayHours = {
    day: WorkingDay;
    open: boolean;
    from: string;
    to: string;
};

interface FormState {
    businessName: string;
    description: string;
    experience: string;
    serviceCategory: string;
    serviceCharges: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

type ErrorKey =
    | "businessName"
    | "description"
    | "experience"
    | "serviceCategory"
    | "serviceCharges"
    | "address"
    | "city"
    | "hours";

type Errors = Partial<Record<ErrorKey, string>>;

// --------------------------------------------------
// Constants
// --------------------------------------------------

const serviceCategories = [
    "Plumbing",
    "Electric",
    "AC Repair",
    "Painting",
    "Carpentry",
    "Cleaning",
];

const initialForm: FormState = {
    businessName: "",
    description: "",
    experience: "",
    serviceCategory: "",
    serviceCharges: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
};

const initialHours: DayHours[] = [
    { day: "Monday", open: true, from: "09:00", to: "19:00" },
    { day: "Tuesday", open: true, from: "09:00", to: "19:00" },
    { day: "Wednesday", open: true, from: "09:00", to: "19:00" },
    { day: "Thursday", open: true, from: "09:00", to: "19:00" },
    { day: "Friday", open: true, from: "09:00", to: "13:00" },
    { day: "Saturday", open: true, from: "10:00", to: "18:00" },
    { day: "Sunday", open: false, from: "09:00", to: "19:00" },
];

const inputBase =
    "w-full rounded-xl border-2 bg-white px-4 py-3 text-sm text-[#37261f] outline-none transition-colors placeholder:text-[#6b7a78]/70";

const inputOk = "border-[#dbe6e4] focus:border-[#5f8a85]";
const inputBad = "border-red-400 focus:border-red-500";

const statusStyle = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-[#d3e7ea] text-[#3f7d6e]",
    rejected: "bg-red-100 text-red-700",
};

// --------------------------------------------------
// Reusable components
// --------------------------------------------------

function SectionCard({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border-2 border-[#dbe6e4] bg-[#f8faf8] p-4 sm:p-6">
            <div className="mb-4">
                <h2 className="text-sm font-bold lg:text-base">
                    {title}
                </h2>

                {description && (
                    <p className="mt-1 text-xs text-[#6b7a78]">
                        {description}
                    </p>
                )}
            </div>

            {children}
        </section>
    );
}

function Field({
    label,
    htmlFor,
    error,
    hint,
    optional,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    hint?: string;
    optional?: boolean;
    children: ReactNode;
}) {
    return (
        <div>
            <label
                htmlFor={htmlFor}
                className="mb-1.5 block text-xs font-bold"
            >
                {label}

                {optional && (
                    <span className="ml-1 font-normal text-[#6b7a78]">
                        (optional)
                    </span>
                )}
            </label>

            {children}

            {hint && !error && (
                <p className="mt-1.5 text-[11px] text-[#6b7a78]">
                    {hint}
                </p>
            )}

            {error && (
                <p
                    id={`${htmlFor}-error`}
                    role="alert"
                    className="mt-1.5 text-[11px] font-medium text-red-600"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

// --------------------------------------------------
// Main component
// --------------------------------------------------

export default function ProviderProfilePage() {
    const [form, setForm] = useState<FormState>(initialForm);
    const [hours, setHours] = useState<DayHours[]>(initialHours);
    const [errors, setErrors] = useState<Errors>({});

    const [existingProfile, setExistingProfile] =
        useState<ProviderProfile | null>(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [saved, setSaved] = useState(false);
    const [apiError, setApiError] = useState("");

    // --------------------------------------------------
    // Load existing provider profile
    // --------------------------------------------------

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getMyProviderProfile();

                if (response.success && response.provider) {
                    const provider = response.provider;

                    setExistingProfile(provider);

                    setForm({
                        businessName: provider.businessName ?? "",
                        description: provider.description ?? "",
                        experience: String(provider.experience ?? ""),
                        serviceCategory: provider.serviceCategory ?? "",
                        serviceCharges: String(provider.serviceCharges ?? ""),
                        address: provider.businessLocation?.address ?? "",
                        city: provider.businessLocation?.city ?? "",
                        state: provider.businessLocation?.state ?? "",
                        country: provider.businessLocation?.country ?? "",
                        postalCode: provider.businessLocation?.postalCode ?? "",
                    });

                    setHours(
                        provider.workingHours.map((item) => ({
                            day: item.day,
                            open: !item.isClosed,
                            from: item.open || "09:00",
                            to: item.close || "17:00",
                        }))
                    );
                }
            } catch (error) {
                const axiosError = error as AxiosError;

                // No existing profile is an expected case.
                // Other errors can be shown to the user.
                if (axiosError.response?.status !== 404) {
                    setApiError(
                        "Profile load nahi ho saki. Please page refresh karein."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        void fetchProfile();
    }, []);

    // --------------------------------------------------
    // Form field update
    // --------------------------------------------------

    const setField = <K extends keyof FormState>(
        key: K,
        value: FormState[K]
    ) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [key]: undefined,
        }));
    };

    // --------------------------------------------------
    // Working hours update
    // --------------------------------------------------

    const updateDay = (
        day: WorkingDay,
        patch: Partial<DayHours>
    ) => {
        setHours((prev) =>
            prev.map((item) =>
                item.day === day
                    ? { ...item, ...patch }
                    : item
            )
        );

        setErrors((prev) => ({
            ...prev,
            hours: undefined,
        }));
    };

    // --------------------------------------------------
    // Input classes
    // --------------------------------------------------

    const fieldProps = (key: ErrorKey) => ({
        id: `field-${key}`,
        "aria-invalid": errors[key] ? true : undefined,
        "aria-describedby": errors[key]
            ? `field-${key}-error`
            : undefined,
        className: `${inputBase} ${errors[key] ? inputBad : inputOk}`,
    });

    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    const validate = (): Errors => {
        const next: Errors = {};

        if (!form.businessName.trim()) {
            next.businessName = "Business name is required.";
        }

        if (form.description.trim().length < 20) {
            next.description =
                "Description must contain at least 20 characters.";
        }

        const experience = Number(form.experience);

        if (
            form.experience.trim() === "" ||
            !Number.isFinite(experience) ||
            experience < 0
        ) {
            next.experience =
                "Enter valid experience (0 or more years).";
        }

        if (!form.serviceCategory) {
            next.serviceCategory = "Please select a service category.";
        }

        const charges = Number(form.serviceCharges);

        if (
            form.serviceCharges.trim() === "" ||
            !Number.isFinite(charges) ||
            charges < 0
        ) {
            next.serviceCharges = "Enter valid service charges.";
        }

        if (!form.address.trim()) {
            next.address = "Address is required.";
        }

        if (!form.city.trim()) {
            next.city = "City is required.";
        }

        const badDay = hours.find(
            (day) =>
                day.open &&
                (
                    !day.from ||
                    !day.to ||
                    day.from >= day.to
                )
        );

        if (badDay) {
            next.hours =
                `${badDay.day}: closing time must be after opening time.`;
        }

        if (hours.length !== 7) {
            next.hours = "Please provide working hours for all seven days.";
        }

        return next;
    };

    // --------------------------------------------------
    // Submit profile
    // --------------------------------------------------

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setSaved(false);
        setApiError("");

        const foundErrors = validate();

        setErrors(foundErrors);

        const errorOrder: ErrorKey[] = [
            "businessName",
            "description",
            "experience",
            "serviceCategory",
            "serviceCharges",
            "address",
            "city",
            "hours",
        ];

        const firstError = errorOrder.find(
            (key) => foundErrors[key]
        );

        if (firstError) {
            document
                .getElementById(`field-${firstError}`)
                ?.focus();

            document
                .getElementById(`section-${firstError}`)
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });

            return;
        }

        // Backend expects these fields at the root level.
        const payload: ProviderProfilePayload = {
            businessName: form.businessName.trim(),
            description: form.description.trim(),
            experience: Number(form.experience),
            serviceCategory: form.serviceCategory,
            serviceCharges: Number(form.serviceCharges),

            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            country: form.country.trim(),
            postalCode: form.postalCode.trim(),

            workingHours: hours.map((day) => ({
                day: day.day,
                open: day.open ? day.from : "00:00",
                close: day.open ? day.to : "00:00",
                isClosed: !day.open,
            })),
        };

        try {
            setSubmitting(true);

            const response = await createProviderProfile(payload);

            if (response.success && response.provider) {
                setExistingProfile(response.provider);
                setSaved(true);

                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
            } else {
                setApiError(
                    response.message || "Profile could not be created."
                );
            }
        } catch (error) {
            const axiosError = error as AxiosError<{
                message?: string;
            }>;

            setApiError(
                axiosError.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // --------------------------------------------------
    // Loading screen
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-[#f8faf8]">
                <p className="text-sm font-semibold text-[#3f7d6e]">
                    Loading provider profile...
                </p>
            </div>
        );
    }

    // --------------------------------------------------
    // Existing profile screen
    // --------------------------------------------------

    if (existingProfile) {
        const status = existingProfile.approvalStatus;

        return (
            <div className="flex min-h-dvh w-full bg-[#f8faf8] text-left text-[#37261f]">
                <ProviderNavbar />

                <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
                    <div className="mx-auto w-full max-w-md md:max-w-3xl lg:max-w-4xl">

                        <header className="rounded-2xl bg-[#e8f3f5] px-4 py-4 lg:px-6 lg:py-5">
                            <h1 className="text-lg font-bold lg:text-xl">
                                Provider Profile
                            </h1>
                        </header>

                        <section
                            className={`mt-5 rounded-2xl p-5 ${statusStyle[status]}`}
                        >
                            <h2 className="font-bold capitalize">
                                Profile status: {status}
                            </h2>

                            {status === "pending" && (
                                <p className="mt-2 text-sm">
                                    Your provider profile is waiting for admin approval.
                                    You will be able to receive requests after approval.
                                </p>
                            )}

                            {status === "approved" && (
                                <p className="mt-2 text-sm">
                                    Your provider profile has been approved.
                                </p>
                            )}

                            {status === "rejected" && (
                                <p className="mt-2 text-sm">
                                    Your provider profile was rejected.
                                    {existingProfile.rejectionReason && (
                                        <> Reason: {existingProfile.rejectionReason}</>
                                    )}
                                </p>
                            )}
                        </section>

                        <SectionCard
                            title="Business details"
                            description="Your submitted provider information."
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-[#6b7a78]">
                                        Business name
                                    </p>
                                    <p className="mt-1 text-sm font-bold">
                                        {existingProfile.businessName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-[#6b7a78]">
                                        Category
                                    </p>
                                    <p className="mt-1 text-sm font-bold">
                                        {existingProfile.serviceCategory}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-[#6b7a78]">
                                        Experience
                                    </p>
                                    <p className="mt-1 text-sm font-bold">
                                        {existingProfile.experience} years
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-[#6b7a78]">
                                        Service charges
                                    </p>
                                    <p className="mt-1 text-sm font-bold">
                                        PKR {existingProfile.serviceCharges}
                                    </p>
                                </div>

                                <div className="sm:col-span-2">
                                    <p className="text-xs text-[#6b7a78]">
                                        Description
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {existingProfile.description}
                                    </p>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Business location">
                            <p className="text-sm font-medium">
                                {existingProfile.businessLocation.address}
                            </p>
                            <p className="mt-1 text-sm text-[#6b7a78]">
                                {[
                                    existingProfile.businessLocation.city,
                                    existingProfile.businessLocation.state,
                                    existingProfile.businessLocation.country,
                                    existingProfile.businessLocation.postalCode,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </p>
                        </SectionCard>

                        <SectionCard title="Working hours">
                            <div className="divide-y divide-[#dbe6e4]">
                                {existingProfile.workingHours.map((day) => (
                                    <div
                                        key={day.day}
                                        className="flex items-center justify-between py-3 text-sm"
                                    >
                                        <span className="font-medium">
                                            {day.day}
                                        </span>

                                        <span className="text-[#6b7a78]">
                                            {day.isClosed
                                                ? "Closed"
                                                : `${day.open} - ${day.close}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        <Link
                            to="/provider/dashboard"
                            className="mt-6 flex items-center justify-center rounded-full bg-[#37261f] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#4a352d]"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    // --------------------------------------------------
    // Create provider profile form
    // --------------------------------------------------

    return (
        <div className="flex min-h-dvh w-full bg-[#f8faf8] text-left text-[#37261f]">
            <ProviderNavbar />

            <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
                <div className="mx-auto w-full max-w-md md:max-w-3xl lg:max-w-4xl">

                    <header className="rounded-2xl bg-[#e8f3f5] px-4 py-4 lg:px-6 lg:py-5">
                        <h1 className="text-lg font-bold lg:text-xl">
                            Provider Profile
                        </h1>

                        <p className="mt-1 text-xs text-[#6b7a78]">
                            Add your business details to start offering services.
                        </p>
                    </header>

                    {saved && (
                        <p
                            role="status"
                            className="mt-4 rounded-2xl bg-[#d3e7ea] px-4 py-3 text-sm font-bold text-[#3f7d6e]"
                        >
                            Your provider profile has been submitted successfully.
                        </p>
                    )}

                    {apiError && (
                        <p
                            role="alert"
                            className="mt-4 rounded-2xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700"
                        >
                            {apiError}
                        </p>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        className="mt-6 space-y-6 lg:mt-8"
                    >
                        {/* Business details */}

                        <SectionCard title="Business details">
                            <div className="grid gap-4 sm:grid-cols-2">

                                <div className="sm:col-span-2">
                                    <Field
                                        label="Business name"
                                        htmlFor="field-businessName"
                                        error={errors.businessName}
                                    >
                                        <input
                                            {...fieldProps("businessName")}
                                            value={form.businessName}
                                            onChange={(e) =>
                                                setField("businessName", e.target.value)
                                            }
                                            placeholder="Ahmed Home Services"
                                            autoComplete="organization"
                                        />
                                    </Field>
                                </div>

                                <Field
                                    label="Service category"
                                    htmlFor="field-serviceCategory"
                                    error={errors.serviceCategory}
                                >
                                    <select
                                        {...fieldProps("serviceCategory")}
                                        value={form.serviceCategory}
                                        onChange={(e) =>
                                            setField("serviceCategory", e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Select category
                                        </option>

                                        {serviceCategories.map((category) => (
                                            <option
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field
                                    label="Experience (years)"
                                    htmlFor="field-experience"
                                    error={errors.experience}
                                >
                                    <input
                                        {...fieldProps("experience")}
                                        type="number"
                                        min={0}
                                        value={form.experience}
                                        onChange={(e) =>
                                            setField("experience", e.target.value)
                                        }
                                        placeholder="5"
                                    />
                                </Field>

                                <div className="sm:col-span-2">
                                    <Field
                                        label="Service charges (PKR)"
                                        htmlFor="field-serviceCharges"
                                        error={errors.serviceCharges}
                                        hint="Enter your starting or standard service fee."
                                    >
                                        <input
                                            {...fieldProps("serviceCharges")}
                                            type="number"
                                            min={0}
                                            value={form.serviceCharges}
                                            onChange={(e) =>
                                                setField("serviceCharges", e.target.value)
                                            }
                                            placeholder="1500"
                                        />
                                    </Field>
                                </div>

                                <div className="sm:col-span-2">
                                    <Field
                                        label="Description"
                                        htmlFor="field-description"
                                        error={errors.description}
                                        hint={`${form.description.trim().length} characters (minimum 20)`}
                                    >
                                        <textarea
                                            {...fieldProps("description")}
                                            rows={5}
                                            value={form.description}
                                            onChange={(e) =>
                                                setField("description", e.target.value)
                                            }
                                            placeholder="Describe your services, experience and how you work..."
                                            className={`${inputBase} ${errors.description ? inputBad : inputOk
                                                } resize-y`}
                                        />
                                    </Field>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Business location */}

                        <SectionCard title="Business location">
                            <div className="grid gap-4 sm:grid-cols-2">

                                <div className="sm:col-span-2">
                                    <Field
                                        label="Address"
                                        htmlFor="field-address"
                                        error={errors.address}
                                    >
                                        <input
                                            {...fieldProps("address")}
                                            value={form.address}
                                            onChange={(e) =>
                                                setField("address", e.target.value)
                                            }
                                            placeholder="Shop 12, Gulberg III"
                                            autoComplete="street-address"
                                        />
                                    </Field>
                                </div>

                                <Field
                                    label="City"
                                    htmlFor="field-city"
                                    error={errors.city}
                                >
                                    <input
                                        {...fieldProps("city")}
                                        value={form.city}
                                        onChange={(e) =>
                                            setField("city", e.target.value)
                                        }
                                        placeholder="Lahore"
                                        autoComplete="address-level2"
                                    />
                                </Field>

                                <Field
                                    label="State / Province"
                                    htmlFor="field-state"
                                    optional
                                >
                                    <input
                                        id="field-state"
                                        value={form.state}
                                        onChange={(e) =>
                                            setField("state", e.target.value)
                                        }
                                        placeholder="Punjab"
                                        autoComplete="address-level1"
                                        className={`${inputBase} ${inputOk}`}
                                    />
                                </Field>

                                <Field
                                    label="Country"
                                    htmlFor="field-country"
                                    optional
                                >
                                    <input
                                        id="field-country"
                                        value={form.country}
                                        onChange={(e) =>
                                            setField("country", e.target.value)
                                        }
                                        placeholder="Pakistan"
                                        autoComplete="country-name"
                                        className={`${inputBase} ${inputOk}`}
                                    />
                                </Field>

                                <Field
                                    label="Postal code"
                                    htmlFor="field-postalCode"
                                    optional
                                >
                                    <input
                                        id="field-postalCode"
                                        value={form.postalCode}
                                        onChange={(e) =>
                                            setField("postalCode", e.target.value)
                                        }
                                        placeholder="54000"
                                        autoComplete="postal-code"
                                        className={`${inputBase} ${inputOk}`}
                                    />
                                </Field>
                            </div>
                        </SectionCard>

                        {/* Working hours */}

                        <div id="section-hours">
                            <SectionCard
                                title="Working hours"
                                description="Select the days you work and set your opening and closing times."
                            >
                                <ul className="divide-y divide-[#dbe6e4]">
                                    {hours.map((day) => (
                                        <li
                                            key={day.day}
                                            className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <label className="flex w-40 cursor-pointer items-center gap-3 text-sm font-medium">
                                                <input
                                                    id={
                                                        day.day === "Monday"
                                                            ? "field-hours"
                                                            : undefined
                                                    }
                                                    type="checkbox"
                                                    checked={day.open}
                                                    onChange={(e) =>
                                                        updateDay(day.day, {
                                                            open: e.target.checked,
                                                        })
                                                    }
                                                    className="size-4 accent-[#3f7d6e]"
                                                />

                                                {day.day}
                                            </label>

                                            {day.open ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="time"
                                                        aria-label={`${day.day} opening time`}
                                                        value={day.from}
                                                        onChange={(e) =>
                                                            updateDay(day.day, {
                                                                from: e.target.value,
                                                            })
                                                        }
                                                        className={`${inputBase} ${inputOk} w-auto py-2`}
                                                    />

                                                    <span className="text-xs text-[#6b7a78]">
                                                        to
                                                    </span>

                                                    <input
                                                        type="time"
                                                        aria-label={`${day.day} closing time`}
                                                        value={day.to}
                                                        onChange={(e) =>
                                                            updateDay(day.day, {
                                                                to: e.target.value,
                                                            })
                                                        }
                                                        className={`${inputBase} ${inputOk} w-auto py-2`}
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-xs text-[#6b7a78] sm:pr-4">
                                                    Closed
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>

                                {errors.hours && (
                                    <p
                                        role="alert"
                                        className="mt-3 text-[11px] font-medium text-red-600"
                                    >
                                        {errors.hours}
                                    </p>
                                )}
                            </SectionCard>
                        </div>

                        {/* Form actions */}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Link
                                to="/provider/dashboard"
                                className="flex items-center justify-center rounded-full bg-[#e8f3f5] px-8 py-4 text-sm font-bold transition hover:bg-[#d3e7ea] sm:min-w-40"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-full bg-[#37261f] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#4a352d] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-48"
                            >
                                {submitting
                                    ? "Saving profile..."
                                    : "Save profile"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
