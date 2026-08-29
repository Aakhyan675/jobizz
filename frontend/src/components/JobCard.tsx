import { Link } from "react-router-dom";
import { EXPERIENCE_LABEL, JOB_TYPE_LABEL, type Job } from "../types";
import { Card } from "./Card";

function formatSalary(job: Job) {
  if (!job.salary_min && !job.salary_max) return "Salary not disclosed";
  const cur = job.salary_currency || "NPR";
  if (job.salary_min && job.salary_max) return `${cur} ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}`;
  return `${cur} ${(job.salary_min || job.salary_max)!.toLocaleString()}`;
}

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      aria-label={`View job ${job.title} at ${job.company_detail?.name ?? "company"}`}
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <Card className="group cursor-pointer p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Logo fallback */}
            <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-slate-500">
              {job.company_detail?.logo ? (
                <img src={job.company_detail.logo} alt={`${job.company_detail.name} logo`} className="h-full w-full object-cover" />
              ) : (
                <span>{(job.company_detail?.name || job.title).slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{job.company_detail?.name}</p>
              <h3 className="mt-0.5 text-lg font-semibold text-slate-900 group-hover:text-brand-700">{job.title}</h3>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {JOB_TYPE_LABEL[job.job_type]}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          <span>{job.location}</span>
          <span>{EXPERIENCE_LABEL[job.experience_level]}</span>
          <span>{formatSalary(job)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-slate-400">{new Date(job.created_at).toLocaleDateString()}</span>
          <span className="font-medium text-brand-600 group-hover:underline">View job →</span>
        </div>
        {job.category_detail && <p className="mt-2 text-xs text-slate-400">{job.category_detail.name}</p>}
      </Card>
    </Link>
  );
}
