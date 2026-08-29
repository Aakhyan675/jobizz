import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { jobsApi } from "../../services/endpoints";
import { getApiError } from "../../services/api";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState, Spinner } from "../../components/States";

export function MyJobsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["my-jobs"], queryFn: jobsApi.mine });
  const qc = useQueryClient();
  const toggle = useMutation({
    mutationFn: (job: { id: number; is_published: boolean }) =>
      job.is_published ? jobsApi.unpublish(job.id) : jobsApi.publish(job.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-jobs"] });
      toast.success("Job updated");
    },
    onError: (e) => toast.error(getApiError(e)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => jobsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-jobs"] });
      toast.success("Job deleted");
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  if (isLoading) return <Spinner />;
  if (!data?.results.length) return <EmptyState title="No jobs yet" body="Post your first opening to start receiving applications." />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My jobs</h1>
        <Link to="/employer/jobs/new">
          <Button>Post job</Button>
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {data.results.map((job) => (
          <Card key={job.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="font-semibold">{job.title}</p>
              <p className="text-sm text-slate-500">
                {job.location} · {job.applications_count ?? 0} applicants · {job.views_count} views
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/employer/jobs/${job.id}/applicants`}>
                <Button variant="secondary">Applicants</Button>
              </Link>
              <Link to={`/employer/jobs/${job.id}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
              <Button variant="ghost" onClick={() => toggle.mutate(job)}>
                {job.is_published ? "Unpublish" : "Publish"}
              </Button>
              <Button variant="danger" onClick={() => remove.mutate(job.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
