
import {
    useState,
    useEffect,
    type FormEvent,
    type ChangeEvent,
} from "react";

import { Link, useNavigate } from "react-router-dom";

import {
    House,
    Mail,
    LockKeyhole,
    UserRound,
    BriefcaseBusiness,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    Camera,
    X,
    Loader2,
    CheckCircle2,
} from "lucide-react";

import { signup } from "../axios/auth.api.tsx";

type Role = "customer" | "provider";

interface SignupForm {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreed: boolean;
}

const Signup = () => {
    const navigate = useNavigate();

    // Role
    const [role, setRole] = useState<Role>("customer");

    // Password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    // Form fields
    const [form, setForm] = useState<SignupForm>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreed: false,
    });

    // Profile image
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");

    // Loading and messages
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Input styling
    const inputClass =
        "h-14 w-full rounded-2xl border border-[#DCE5E3] bg-white pl-12 pr-4 outline-none transition focus:border-[#57877E] focus:ring-2 focus:ring-[#57877E]/20";

    // Cleanup image preview URL
    useEffect(() => {
        if (!image) {
            setImagePreview("");
            return;
        }

        const previewURL = URL.createObjectURL(image);
        setImagePreview(previewURL);

        return () => {
            URL.revokeObjectURL(previewURL);
        };
    }, [image]);

    // Update form fields
    const handleChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value, checked, type } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        setError("");
    };

    // Handle image upload
    const handleImageChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const selectedImage = e.target.files?.[0];

        if (!selectedImage) return;

        setError("");

        // Validate image type
        if (!selectedImage.type.startsWith("image/")) {
            setError("Please select a valid image.");
            e.target.value = "";
            return;
        }

        // Validate image size (5MB)
        if (selectedImage.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB.");
            e.target.value = "";
            return;
        }

        setImage(selectedImage);
    };

    // Remove selected image
    const removeImage = () => {
        setImage(null);

        const fileInput = document.getElementById(
            "signup-image"
        ) as HTMLInputElement | null;

        if (fileInput) {
            fileInput.value = "";
        }
    };

    // Handle signup
    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Required fields validation
        if (
            !form.name.trim() ||
            !form.email.trim() ||
            !form.password ||
            !form.confirmPassword
        ) {
            setError("Please fill all required fields.");
            return;
        }

        // Name validation
        if (form.name.trim().length < 3) {
            setError("Name must contain at least 3 characters.");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(form.email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        // Password validation
        if (form.password.length < 8) {
            setError(
                "Password must contain at least 8 characters."
            );
            return;
        }

        // Confirm password validation
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // Image validation
        if (!image) {
            setError("Please upload your profile image.");
            return;
        }

        // Terms validation
        if (!form.agreed) {
            setError(
                "Please accept the Terms of Service and Privacy Policy."
            );
            return;
        }

        try {
            setLoading(true);

            // Customer -> user (Backend role)
            // Provider -> provider (Backend role)
            const signupData = {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                role: role === "customer" ? "user" as const : "provider" as const,
                image,
            };

            // API call
            const response = await signup(signupData);

            if (response.success) {
                setSuccess(
                    response.message || "Account created successfully!"
                );

                // Redirect to login after successful signup
                navigate("/login", {
                    state: {
                        message:
                            response.message ||
                            "Account created successfully. Please login.",
                    },
                });

                return;
            }

            setError(
                response.message || "Something went wrong."
            );

        } catch (err: any) {
            console.error("Signup error:", err);

            const statusCode = err.response?.status;

            const errorMessage =
                err.response?.data?.message;

            if (statusCode === 409) {
                setError(
                    errorMessage || "This email is already registered."
                );
            } else {
                setError(
                    errorMessage ||
                    "Unable to create your account. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAF9] text-[#34241F] lg:grid lg:grid-cols-2">

            {/* LEFT SIDE */}
            <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#34241F] p-12 text-white lg:flex">

                <Link to="/" className="flex items-center gap-3 text-2xl font-bold">
                    <House className="text-[#A9D1CC]" />
                    Services<span className="text-[#A9D1CC]">Pro</span>.
                </Link>

                <div className="relative z-10 max-w-lg">

                    <h1 className="text-5xl font-bold leading-tight xl:text-6xl">
                        A better home
                        <br />
                        starts <span className="text-[#A9D1CC]">here.</span>
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-[#DDD1CD]">
                        Find trusted home services or grow your
                        service business in one easy place.
                    </p>

                    <div className="mt-10 flex items-center gap-4 rounded-2xl bg-white/10 p-5">
                        <ShieldCheck
                            size={30}
                            className="shrink-0 text-[#A9D1CC]"
                        />

                        <span>
                            Provider verification is reviewed by our team.
                        </span>
                    </div>

                </div>

                <p className="text-sm text-[#C8BDB8]">
                    ServicesPro · Your home service partner
                </p>

                <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full border-65 border-[#5A8886]/25" />

            </section>

            {/* RIGHT SIDE */}
            <section className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10 lg:px-16">

                <div className="mx-auto w-full max-w-110">

                    {/* Mobile Logo */}
                    <div className="mb-8 flex items-center gap-2 text-xl font-bold lg:hidden">
                        <House className="text-[#57877E]" />
                        Services<span className="text-[#57877E]">Pro</span>.
                    </div>

                    <span className="rounded-full bg-[#E8F3F5] px-4 py-2 text-sm font-semibold text-[#57877E]">
                        Join ServicesPro
                    </span>

                    <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
                        Create your account
                    </h2>

                    <p className="mt-3 text-sm text-[#756D69]">
                        Choose your role and enter your details.
                    </p>

                    {/* ROLE SELECTION */}
                    <div className="mt-7 grid grid-cols-2 gap-3">

                        {([
                            {
                                value: "customer",
                                label: "Customer",
                                icon: UserRound,
                            },
                            {
                                value: "provider",
                                label: "Provider",
                                icon: BriefcaseBusiness,
                            },
                        ] as const).map((item) => {

                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    aria-pressed={role === item.value}
                                    onClick={() => {
                                        setRole(item.value);
                                        setError("");
                                    }}
                                    className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-3 py-4 text-sm font-semibold transition ${role === item.value
                                        ? "border-[#57877E] bg-[#E8F3F5]"
                                        : "border-[#DCE5E3] bg-white text-[#756D69]"
                                        }`}
                                >
                                    <Icon size={19} />
                                    {item.label}
                                </button>
                            );
                        })}

                    </div>

                    {/* PROVIDER INFORMATION */}
                    {role === "provider" && (
                        <p className="mt-4 rounded-xl bg-[#E8F3F5] p-3 text-xs leading-5 text-[#426E65]">
                            Provider accounts require document verification
                            and Admin approval before becoming verified.
                        </p>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 space-y-4"
                    >

                        {/* PROFILE IMAGE */}
                        <div>

                            <label className="mb-2 block text-sm font-semibold">
                                Profile image
                                <span className="text-red-500"> *</span>
                            </label>

                            <div className="flex items-center gap-4">

                                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#DCE5E3] bg-white">

                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Profile preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Camera
                                            size={27}
                                            className="text-[#57877E]"
                                        />
                                    )}

                                </div>

                                <div className="flex flex-col gap-2">

                                    <label
                                        htmlFor="signup-image"
                                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#DCE5E3] bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-[#E8F3F5]"
                                    >
                                        <Camera size={17} />
                                        {image ? "Change image" : "Upload image"}
                                    </label>

                                    <input
                                        id="signup-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />

                                    {image && (
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="flex items-center gap-1 text-left text-xs text-red-500"
                                        >
                                            <X size={14} />
                                            Remove image
                                        </button>
                                    )}

                                    <p className="text-xs text-[#756D69]">
                                        PNG, JPG or WEBP. Max 5MB.
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* FULL NAME */}
                        <div>

                            <label
                                htmlFor="signup-name"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Full name
                            </label>

                            <div className="relative">

                                <UserRound
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#57877E]"
                                />

                                <input
                                    id="signup-name"
                                    name="name"
                                    type="text"
                                    required
                                    minLength={3}
                                    autoComplete="name"
                                    placeholder="Enter your full name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className={inputClass}
                                />

                            </div>

                        </div>

                        {/* EMAIL */}
                        <div>

                            <label
                                htmlFor="signup-email"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Email address
                            </label>

                            <div className="relative">

                                <Mail
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#57877E]"
                                />

                                <input
                                    id="signup-email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={inputClass}
                                />

                            </div>

                        </div>

                        {/* PASSWORD */}
                        <div>

                            <label
                                htmlFor="signup-password"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Password
                            </label>

                            <div className="relative">

                                <LockKeyhole
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#57877E]"
                                />

                                <input
                                    id="signup-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    placeholder="At least 8 characters"
                                    value={form.password}
                                    onChange={handleChange}
                                    className={inputClass + " pr-12"}
                                />

                                <button
                                    type="button"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#756D69]"
                                >
                                    {showPassword
                                        ? <EyeOff size={19} />
                                        : <Eye size={19} />
                                    }
                                </button>

                            </div>

                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div>

                            <label
                                htmlFor="signup-confirm"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Confirm password
                            </label>

                            <div className="relative">

                                <LockKeyhole
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#57877E]"
                                />

                                <input
                                    id="signup-confirm"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    required
                                    autoComplete="new-password"
                                    placeholder="Re-enter your password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    className={inputClass + " pr-12"}
                                />

                                <button
                                    type="button"
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide confirm password"
                                            : "Show confirm password"
                                    }
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#756D69]"
                                >
                                    {showConfirmPassword
                                        ? <EyeOff size={19} />
                                        : <Eye size={19} />
                                    }
                                </button>

                            </div>

                        </div>

                        {/* TERMS AND CONDITIONS */}
                        <label className="flex cursor-pointer items-start gap-3 py-2 text-xs leading-5 text-[#756D69]">

                            <input
                                type="checkbox"
                                name="agreed"
                                checked={form.agreed}
                                onChange={handleChange}
                                className="mt-1 accent-[#57877E]"
                            />

                            <span>
                                I agree to the Terms of Service and Privacy Policy.
                            </span>

                        </label>

                        {/* ERROR MESSAGE */}
                        {error && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                            >
                                {error}
                            </div>
                        )}

                        {/* SUCCESS MESSAGE */}
                        {success && (
                            <div
                                role="status"
                                className="flex items-center gap-2 rounded-xl bg-[#E8F3F5] p-3 text-sm text-[#426E65]"
                            >
                                <CheckCircle2 size={18} />
                                {success}
                            </div>
                        )}

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#34241F] font-semibold text-white transition hover:bg-[#4B352E] disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {loading ? (
                                <>
                                    <Loader2
                                        size={20}
                                        className="animate-spin"
                                    />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight size={19} />
                                </>
                            )}

                        </button>

                    </form>

                    {/* LOGIN LINK */}
                    <p className="mt-7 text-center text-sm text-[#756D69]">

                        Already have an account?{" "}

                        <Link
                            to="/login"
                            className="font-bold text-[#57877E] hover:underline"
                        >
                            Login
                        </Link>

                    </p>

                </div>

            </section>

        </main>
    );
};

export default Signup;
