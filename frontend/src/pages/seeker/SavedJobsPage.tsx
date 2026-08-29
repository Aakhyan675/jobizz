import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useSavedJobs } from "../../hooks/useApplications";
import { savedJobsApi } from "../../services/endpoints";
import { JobCard } from "../../components/JobCard";
import { Button } from "../../components/Button";
import { EmptyState, Spinner } from "../../components/States";

export function SavedJobsPage() {
  const { data, isLoading } = useSavedJobs();
  const qc = useQueryClient();
  const remove = useMutation({
    mutationFn: (id: number) => savedJobsApi.remove(id),
    onSuccess: () => {
      toast.success("Removed from saved jobs");
      qc.invalidateQueries({ queryKey: ["saved-jobs"] });
    },
  });
  if (isLoading) return <Spinner />;
  if (!data?.results.length) return <EmptyState title="No saved jobs" body="Save roles you want to revisit." />;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Saved jobs</h1>
      {data.results.map((item) => (
        <div key={item.id} className="relative">
          <JobCard job={item.job_detail} />
          <div className="mt-2 flex gap-2">
            <Link to={`/jobs/${item.job}`}>
              <Button variant="secondary">View</Button>
            </Link>
            <Button variant="ghost" onClick={() => remove.mutate(item.id)}>
              Unsave
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
