import { Link } from "react-router-dom";
import { useDashboardStats } from "../../hooks/useApplications";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/Card";
import { Spinner } from "../../components/States";

export function SeekerOverviewPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboardStats();
  if (isLoading) return <Spinner />;
  return (
    <div>
      <h1 className="text-2xl font-bold">Hi, {user?.first_name || user?.display_name}</h1>
      <p className="text-sm text-slate-500">Track saved jobs and applications from one place.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Applications</p>
          <p className="mt-1 text-3xl font-bold">{data?.applications_count ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Saved jobs</p>
          <p className="mt-1 text-3xl font-bold">{data?.saved_jobs_count ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Shortlisted</p>
          <p className="mt-1 text-3xl font-bold">{data?.by_status?.shortlisted ?? 0}</p>
        </Card>
      </div>
      <Link to="/jobs" className="mt-6 inline-block text-sm font-semibold text-brand-700">
        Browse open jobs →
      </Link>
    </div>
  );
}
