import { Link } from "react-router-dom";
import { useApplications } from "../../hooks/useApplications";
import { STATUS_LABEL } from "../../types";
import { Card } from "../../components/Card";
import { EmptyState, Spinner } from "../../components/States";

const colors: Record<string, string> = {
  applied: "bg-slate-100 text-slate-700",
  shortlisted: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
  hired: "bg-brand-50 text-brand-700",
};

export function SeekerApplicationsPage() {
  const { data, isLoading } = useApplications();
  if (isLoading) return <Spinner />;
  if (!data?.results.length) return <EmptyState title="No applications yet" body="Apply to a role and track it here." />;
  return (
    <div>
      <h1 className="text-2xl font-bold">My applications</h1>
      <div className="mt-4 space-y-3">
        {data.results.map((app) => (
          <Card key={app.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <Link to={`/jobs/${app.job}`} className="font-semibold hover:text-brand-700">
                {app.job_title}
              </Link>
              <p className="text-sm text-slate-500">{app.company_name}</p>
              <p className="mt-1 text-xs text-slate-400">Applied {new Date(app.created_at).toLocaleDateString()}</p>
              {app.resume && <p className="mt-1 text-xs text-slate-500">Resume: {decodeURIComponent(app.resume.split("/").pop() || "resume")} attached ✓</p>}
              {app.cover_letter && <p className="mt-1 text-xs text-slate-500">Cover letter included</p>}
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[app.status]}`}>
              {STATUS_LABEL[app.status]}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
