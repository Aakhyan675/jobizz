import { Link } from "react-router-dom";
import { EXPERIENCE_LABEL, JOB_TYPE_LABEL, type Job } from "../types";
import { Card } from "./Card";

function formatSalary(job: Job) {
  if (!job.salary_min && !job.salary_max) return "Salary not disclosed";
  const cur = job.salary_currency || "NPR";
  if (job.salary_min && job.salary_max) return `${cur} ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}`;
  return `${cur} ${(job.salary_min || job.salary_max)!.toLocaleString()}`;
}

// Deterministic letter-avatar: hash company name → consistent color from palette
// Design so real logoUrl can override: if logoUrl/logo exists, show img instead
// cardBorder is muted pastel matching avatar (same hash, low saturation) for block/cube border
const avatarPalette = [
  { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", cardBorder: "border-indigo-200", borderHex: "#c7d2fe" },
  { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-100", cardBorder: "border-sky-200", borderHex: "#bae6fd" },
  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", cardBorder: "border-emerald-200", borderHex: "#a7f3d0" },
  { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", cardBorder: "border-amber-200", borderHex: "#fde68a" },
  { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", cardBorder: "border-rose-200", borderHex: "#fecdd3" },
  { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100", cardBorder: "border-violet-200", borderHex: "#ddd6fe" },
  { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-100", cardBorder: "border-teal-200", borderHex: "#99f6e4" },
  { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100", cardBorder: "border-orange-200", borderHex: "#fed7aa" },
  { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-100", cardBorder: "border-cyan-200", borderHex: "#a5f3fc" },
  { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-100", cardBorder: "border-fuchsia-200", borderHex: "#f5d0fe" },
];

function getInitials(name: string): string {
  const clean = name.trim().replace(/[^A-Za-z0-9 ]/g, "");
  if (!clean) return "J";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return hash;
}

function getAvatarStyle(name: string) {
  const idx = hashString(name.toLowerCase()) % avatarPalette.length;
  return avatarPalette[idx];
}

export function JobCard({ job }: { job: Job }) {
  const companyName = job.company_detail?.name || "Company";
  const initials = getInitials(companyName);
  const avatar = getAvatarStyle(companyName);
  // Support future logoUrl field: prefer logoUrl, then logo, else letter-avatar
  const logoUrl = (job.company_detail as unknown as { logoUrl?: string | null })?.logoUrl ?? job.company_detail?.logo ?? null;

  const posted = new Date(job.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <Link
      to={`/jobs/${job.id}`}
      aria-label={`View job ${job.title} at ${companyName}`}
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <Card
        style={{ borderColor: avatar.borderHex }}
        className="group flex cursor-pointer gap-4 p-5 !border-2 !bg-amber-50 !shadow-sm transition duration-200 hover:-translate-y-0.5 hover:!shadow-md"
      >
        {/* Left: deterministic letter-avatar or real logo */}
        <div
          aria-hidden
          className={`hidden h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border text-sm font-bold leading-none sm:grid ${avatar.bg} ${avatar.text} ${avatar.border}`}
          title={companyName}
        >
          {logoUrl ? (
            <img src={logoUrl} alt={`${companyName} logo`} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <span className="tracking-wide">{initials}</span>
          )}
        </div>

        {/* Mobile avatar smaller */}
        <div
          aria-hidden
          className={`grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border text-xs font-bold sm:hidden ${avatar.bg} ${avatar.text} ${avatar.border}`}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Title — most prominent */}
          <h3 className="line-clamp-2 text-[16px] font-semibold leading-snug text-slate-900 group-hover:text-brand-700">
            {job.title}
          </h3>

          {/* Company + location — secondary/muted */}
          <p className="mt-1 line-clamp-1 text-sm text-slate-500">
            <span className="font-medium text-slate-700">{companyName}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span>{job.location}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span>{posted}</span>
          </p>

          {/* Pill badges — job type / tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
              {JOB_TYPE_LABEL[job.job_type]}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
              {EXPERIENCE_LABEL[job.experience_level]}
            </span>
            {job.category_detail && (
              <span className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                {job.category_detail.name}
              </span>
            )}
          </div>

          {/* Bottom row: salary + CTA */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-600">
              <span className="font-medium text-slate-700">{formatSalary(job)}</span>
              <span className="mx-2 text-slate-300">·</span>
              <span className="text-xs text-slate-400">{job.views_count} views</span>
            </span>

            {/* Pill CTA — consistent placement */}
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600">
              View
              <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Export helper for potential reuse (e.g., company profile)
export { getInitials, getAvatarStyle, hashString };
