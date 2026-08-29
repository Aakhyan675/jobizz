import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminApi } from "../../services/endpoints";
import { Card } from "../../components/Card";
import { Spinner, ErrorState } from "../../components/States";

export function AdminDashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.stats,
  });

  if (isLoading) return <Spinner />;
  if (isError)
    return (
      <div className="container-page py-10">
        <ErrorState message={(error as Error)?.message || "Could not load admin stats. Admin only."} />
      </div>
    );
  if (!data) return null;

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">System overview — users, jobs, applications.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total users</p>
          <p className="mt-1 text-3xl font-bold">{data.total_users}</p>
          <p className="mt-1 text-xs text-slate-400">Seekers {data.seekers} · Employers {data.employers} · Admins {data.admins}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total jobs</p>
          <p className="mt-1 text-3xl font-bold">{data.total_jobs}</p>
          <p className="mt-1 text-xs text-slate-400">Active {data.active_jobs} · Expired {data.expired_jobs}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total applications</p>
          <p className="mt-1 text-3xl font-bold">{data.total_applications}</p>
          <p className="mt-1 text-xs text-slate-400">By status: {Object.entries(data.by_status).map(([k, v]) => `${k}:${v}`).join(" · ") || "—"}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Recent activity</p>
          <p className="mt-1 text-lg font-semibold">Jobs per category</p>
          <p className="mt-1 text-xs text-slate-500">{Object.entries(data.jobs_by_category).slice(0, 3).map(([k, v]) => `${k ?? "—"}:${v}`).join(" · ") || "—"}</p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Recent jobs</h2>
          <div className="mt-4 space-y-2">
            {data.recent_jobs.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="block rounded-xl border border-slate-200 px-4 py-3 hover:border-brand-200">
                <p className="font-medium">{job.title}</p>
                <p className="text-xs text-slate-500">{job.company__name} · {job.is_published ? "Active" : "Expired"} · {new Date(job.created_at).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
          <Link to="/jobs" className="mt-4 inline-block text-sm font-semibold text-brand-700">View all jobs →</Link>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Recent users</h2>
          <div className="mt-4 space-y-2">
            {data.recent_users.map((u) => (
              <div key={u.id} className="rounded-xl border border-slate-200 px-4 py-3">
                <p className="font-medium">{u.first_name} {u.last_name} <span className="text-xs text-slate-400">({u.role})</span></p>
                <p className="text-xs text-slate-500">{u.email} · {new Date(u.date_joined).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-8 flex gap-3">
        <Link to="/jobs" className="text-sm font-semibold text-brand-700">Browse jobs</Link>
        <span className="text-slate-300">·</span>
        <a href="/admin/" target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-700">Django Admin →</a>
      </div>
    </div>
  );
}
