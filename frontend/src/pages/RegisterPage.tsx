import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { dashboardPath, useAuth } from "../context/AuthContext";
import { getApiError } from "../services/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

interface Form {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  password_confirm: string;
}

function getPasswordStrength(pwd: string): { label: string; color: string; width: string } {
  if (!pwd) return { label: "", color: "", width: "0%" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: "Weak", color: "bg-rose-500", width: "33%" };
  if (score === 2) return { label: "Fair", color: "bg-amber-500", width: "66%" };
  return { label: "Strong", color: "bg-emerald-500", width: "100%" };
}

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ defaultValues: { role: "job_seeker" } });
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const role = watch("role");
  const pwd = watch("password") || "";
  const strength = getPasswordStrength(pwd);

  const onSubmit = async (values: Form) => {
    setGeneralError(null);
    if (values.password !== values.password_confirm) {
      setGeneralError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }
    if (values.password.length < 8) {
      setGeneralError("Password must be at least 8 characters.");
      toast.error("Password must be at least 8 characters.");
      return;
    }
    try {
      // Do not log passwords/tokens
      const payload: Record<string, string> = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || "",
        role: values.role, // must be exactly "job_seeker" or "employer"
        password: values.password,
        password_confirm: values.password_confirm,
      };
      const user = await signup(payload);
      toast.success("Account created successfully. Redirecting to your dashboard…");
      navigate(dashboardPath(user.role), { replace: true });
    } catch (e) {
      const msg = getApiError(e, "Could not create account. Check your details.");
      // Detect network failure (no response)
      const isNetwork = msg.toLowerCase().includes("network") || msg.includes("Cannot connect") || (e as { message?: string })?.message?.includes("Network");
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
        {/* Left: branding */}
        <div className="relative hidden overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-900 via-brand-700 to-indigo-600 p-10 text-white shadow-card lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-indigo-400/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-700 font-bold">J</span>
              <span className="text-xl font-bold">Jobizz</span>
              <span className="ml-2 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">Mero Job inspired</span>
            </div>
            <h1 className="mt-10 text-4xl font-bold leading-tight">Create your Jobizz account</h1>
            <p className="mt-4 max-w-md text-brand-50">
              Join thousands in Nepal — find your next role or hire the right talent. Free, fast, and built for both seekers and employers.
            </p>
            <div className="mt-8 grid gap-3 text-sm">
              <div className="flex gap-3 rounded-xl bg-white/10 p-3 backdrop-blur">
                <span className="mt-0.5">✦</span>
                <div>
                  <p className="font-semibold">For job seekers</p>
                  <p className="text-brand-100">Search, save, apply, and track status in one dashboard.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl bg-white/10 p-3 backdrop-blur">
                <span className="mt-0.5">✦</span>
                <div>
                  <p className="font-semibold">For employers</p>
                  <p className="text-brand-100">Post jobs, manage applicants, shortlist in minutes.</p>
                </div>
              </div>
            </div>
          </div>
          <p className="relative text-xs text-brand-100">Already have an account? <Link to="/login" className="font-semibold text-white underline">Log in</Link></p>
        </div>

        {/* Right: form card */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-2xl font-bold">Join Jobizz</h2>
          <p className="mt-1 text-sm text-slate-500">Choose your role and create an account — it takes 30 seconds.</p>

          {/* Role cards */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setValue("role", "job_seeker")}
              className={`rounded-2xl border-2 p-4 text-left transition ${role === "job_seeker" ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300 bg-slate-50/50"}`}
              aria-pressed={role === "job_seeker"}
            >
              <p className="font-semibold">{role === "job_seeker" ? "✓ " : ""}I’m looking for a job</p>
              <p className="mt-1 text-xs text-slate-500">→ role: job_seeker</p>
              <p className="mt-1 text-xs text-slate-600">Browse & apply, save jobs, track applications.</p>
            </button>
            <button
              type="button"
              onClick={() => setValue("role", "employer")}
              className={`rounded-2xl border-2 p-4 text-left transition ${role === "employer" ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300 bg-slate-50/50"}`}
              aria-pressed={role === "employer"}
            >
              <p className="font-semibold">{role === "employer" ? "✓ " : ""}I’m hiring talent</p>
              <p className="mt-1 text-xs text-slate-500">→ role: employer</p>
              <p className="mt-1 text-xs text-slate-600">Post jobs, review applicants, hire faster.</p>
            </button>
          </div>
          <input type="hidden" {...register("role", { required: true })} />

          {generalError && (
            <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {generalError}
            </div>
          )}

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <Input
                label="First name"
                placeholder="Sita"
                error={errors.first_name?.message}
                {...register("first_name", { required: "First name is required" })}
              />
            </div>
            <div>
              <Input
                label="Last name"
                placeholder="Sharma"
                error={errors.last_name?.message}
                {...register("last_name", { required: "Last name is required" })}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                })}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Phone (optional)"
                placeholder="+977 9800000000"
                {...register("phone")}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">Password</span>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="At least 8 characters"
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-50 ${errors.password ? "border-rose-400" : "border-slate-200"}`}
                    {...register("password", { required: "Password is required", minLength: { value: 8, message: "At least 8 characters" } })}
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
                {pwd && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div className={`h-1.5 rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Strength: {strength.label}</p>
                  </div>
                )}
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">Confirm password</span>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat password"
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-50 ${errors.password_confirm ? "border-rose-400" : "border-slate-200"}`}
                    {...register("password_confirm", { required: "Confirm your password" })}
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password_confirm && <span className="mt-1 block text-xs text-rose-600">{errors.password_confirm.message}</span>}
              </label>
            </div>

            <div className="sm:col-span-2">
              <Button className="w-full" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating your account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
              <p className="mt-3 text-center text-xs text-slate-400">By registering you agree to our Terms • Public registration as admin is disabled</p>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
