import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDashboardStats } from "../../hooks/useApplications";
import { jobsApi } from "../../services/endpoints";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Spinner } from "../../components/States";

export function EmployerOverviewPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboardStats();
  const jobs = useQuery({ queryKey: ["my-jobs"], queryFn: jobsApi.mine });
  if (isLoading) return <Spinner />;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Employer dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back, {user?.display_name}</p>
        </div>
        <Link to="/employer/jobs/new">
          <Button>Post new job</Button>
        </Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          ["Jobs", data?.jobs_count ?? 0],
          ["Published", data?.published_jobs_count ?? 0],
          ["Views", data?.total_views ?? 0],
          ["Applicants", data?.applications_count ?? 0],
        ].map(([label, value]) => (
          <Card key={String(label)} className="p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/employer/jobs">
          <Button variant="secondary">Manage jobs</Button>
        </Link>
        <Link to="/employer/company">
          <Button variant="secondary">Company profile</Button>
        </Link>
      </div>
      <h2 className="mt-10 text-lg font-semibold">Recent jobs</h2>
      <div className="mt-3 space-y-2">
        {jobs.data?.results.slice(0, 5).map((job) => (
          <Link key={job.id} to={`/employer/jobs/${job.id}/applicants`} className="block rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-brand-200">
            <p className="font-medium">{job.title}</p>
            <p className="text-xs text-slate-500">
              {job.applications_count ?? 0} applicants · {job.views_count} views · {job.is_published ? "Published" : "Draft"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
