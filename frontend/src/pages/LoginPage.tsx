import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { dashboardPath, useAuth } from "../context/AuthContext";
import { getApiError } from "../services/api";
import { Button } from "../components/Button";

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string; password: string }>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [showPwd, setShowPwd] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const onSubmit = async (values: { email: string; password: string }) => {
    setGeneralError(null);
    try {
      const user = await login(values.email.trim(), values.password);
      toast.success("Login successful");
      navigate(from || dashboardPath(user.role), { replace: true });
    } catch (e) {
      const msg = getApiError(e, "Invalid email or password");
      const isNetwork = msg.toLowerCase().includes("network") || (e as { message?: string })?.message?.includes("Network");
      const friendly = isNetwork
        ? "Cannot reach the server. Is the Django backend running at " + (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api") + "?"
        : msg;
      setGeneralError(friendly);
      toast.error(friendly);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-indigo-50/40 to-brand-50/30">
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.05fr_1.15fr] lg:py-16">
        {/* Left branding */}
        <div className="relative hidden overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-900 via-brand-700 to-indigo-600 p-10 text-white shadow-card lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-indigo-400/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-700 font-bold">J</span>
              <span className="text-xl font-bold">Jobizz</span>
            </div>
            <h1 className="mt-10 text-4xl font-bold leading-tight">Welcome back</h1>
            <p className="mt-4 max-w-md text-brand-50">Log in to your Jobizz dashboard — seekers and employers use the same secure sign-in.</p>
            <div className="mt-8 rounded-xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold">Demo accounts</p>
              <p className="mt-2 text-xs text-brand-100">seeker@jobizz.dev / Jobizz123! → seeker</p>
              <p className="text-xs text-brand-100">employer@jobizz.dev / Jobizz123! → employer</p>
              <p className="text-xs text-brand-100">admin@jobizz.dev / Jobizz123! → admin</p>
            </div>
          </div>
          <p className="relative text-xs text-brand-100">New here? <Link to="/register" className="font-semibold text-white underline">Create account</Link></p>
        </div>

        {/* Right form */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-2xl font-bold">Log in to Jobizz</h2>
          <p className="mt-1 text-sm text-slate-500">Use your email and password.</p>

          {generalError && (
            <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {generalError}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-700">Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-50 ${errors.email ? "border-rose-400" : "border-slate-200"}`}
                {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Valid email required" } })}
              />
              {errors.email && <span className="mt-1 block text-xs text-rose-600">{errors.email.message}</span>}
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-700">Password</span>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Your password"
                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-50 ${errors.password ? "border-rose-400" : "border-slate-200"}`}
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <span className="mt-1 block text-xs text-rose-600">{errors.password.message}</span>}
            </label>

            <Button className="w-full" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-brand-700 hover:underline">Forgot password?</Link>
            <Link to="/register" className="font-semibold text-brand-700 hover:underline">Create account →</Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">Wrong VITE_API_URL? Check frontend/.env — must point to Django at http://localhost:8000/api or http://127.0.0.1:8000/api</p>
        </div>
      </div>
    </div>
  );
}
