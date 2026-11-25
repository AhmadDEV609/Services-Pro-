
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import {
    House,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    Loader2,
} from "lucide-react";

import axios from "axios";

import { login } from "../axios/auth.api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { setUser } = useAuth();

    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const signupMessage = location.state?.message;


    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (loading) return;

        setError("");

        if (!form.email.trim() || !form.password) {
            setError("Please enter email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await login({
                email: form.email.trim().toLowerCase(),
                password: form.password,
            });

            console.log("LOGIN RESPONSE:", response);

            if (!response.success || !response.user) {
                setError(response.message || "Login failed.");
                return;
            }

            const loggedInUser = response.user;

            console.log("LOGGED IN ROLE:", loggedInUser.role);

            // Update AuthContext
            setUser(loggedInUser);

            // Redirect based on role
            switch (loggedInUser.role) {
                case "admin":
                    navigate("/admin/dashboard", { replace: true });
                    break;

                case "provider":
                    navigate("/provider/dashboard", { replace: true });
                    break;

                case "user":
                    navigate("/", { replace: true });
                    break;

                default:
                    setUser(null);
                    setError("Invalid user role.");
            }

        } catch (err: unknown) {
            console.error("LOGIN ERROR:", err);

            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const message = err.response?.data?.message;

                if (status === 401) {
                    setError("Invalid email or password.");
                } else if (status === 403) {
                    setError(message || "Account access restricted.");
                } else {
                    setError(message || "Unable to login. Please try again.");
                }
            } else {
                setError("Something went wrong.");
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
                        Your home.
                        <br />
                        <span className="text-[#A9D1CC]">
                            In safe hands.
                        </span>
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-[#DDD1CD]">
                        Welcome back. Find trusted professionals
                        for every corner of your home.
                    </p>

                    <div className="mt-10 flex items-center gap-4 rounded-2xl bg-white/10 p-5">
                        <ShieldCheck
                            size={30}
                            className="shrink-0 text-[#A9D1CC]"
                        />
                        <span>
                            Simple, reliable home service bookings.
                        </span>
                    </div>
                </div>

                <p className="text-sm text-[#C8BDB8]">
                    ServicesPro · Your home service partner
                </p>

                <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full border-65 border-[#5A8886]/25" />
            </section>

            {/* RIGHT SIDE */}
            <section className="flex min-h-screen flex-col justify-center px-5 py-12 sm:px-10 lg:px-16">

                <div className="mx-auto w-full max-w-110">

                    <div className="mb-10 flex items-center gap-2 text-xl font-bold lg:hidden">
                        <House className="text-[#57877E]" />
                        Services<span className="text-[#57877E]">Pro</span>.
                    </div>

                    <span className="rounded-full bg-[#E8F3F5] px-4 py-2 text-sm font-semibold text-[#57877E]">
                        Welcome back
                    </span>

                    <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
                        Login to your account
                    </h2>

                    <p className="mt-3 text-sm text-[#756D69]">
                        Enter your details to continue.
                    </p>

                    {signupMessage && (
                        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                            {signupMessage}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="mt-9 space-y-5"
                    >

                        {/* EMAIL */}
                        <div>
                            <label
                                htmlFor="login-email"
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
                                    id="login-email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={(e) => {
                                        setForm({
                                            ...form,
                                            email: e.target.value,
                                        });
                                        setError("");
                                    }}
                                    className="h-14 w-full rounded-2xl border border-[#DCE5E3] bg-white pl-12 pr-4 outline-none transition focus:border-[#57877E] focus:ring-2 focus:ring-[#57877E]/20"
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <div className="mb-2 flex justify-between">
                                <label
                                    htmlFor="login-password"
                                    className="text-sm font-semibold"
                                >
                                    Password
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-semibold text-[#57877E] hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <div className="relative">
                                <LockKeyhole
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#57877E]"
                                />

                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={(e) => {
                                        setForm({
                                            ...form,
                                            password: e.target.value,
                                        });
                                        setError("");
                                    }}
                                    className="h-14 w-full rounded-2xl border border-[#DCE5E3] bg-white pl-12 pr-12 outline-none transition focus:border-[#57877E] focus:ring-2 focus:ring-[#57877E]/20"
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
                                    {showPassword ? (
                                        <EyeOff size={19} />
                                    ) : (
                                        <Eye size={19} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* ERROR */}
                        {error && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                            >
                                {error}
                            </div>
                        )}

                        {/* LOGIN BUTTON */}
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
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Login
                                    <ArrowRight size={19} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-[#756D69]">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="font-bold text-[#57877E] hover:underline"
                        >
                            Create account
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Login;
