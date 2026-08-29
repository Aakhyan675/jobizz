import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useJob } from "../hooks/useJobs";
import { useAuth } from "../context/AuthContext";
import { applicationsApi, profilesApi, savedJobsApi } from "../services/endpoints";
import { getApiError } from "../services/api";
import { EXPERIENCE_LABEL, JOB_TYPE_LABEL } from "../types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { TextArea } from "../components/Input";
import { ErrorState, Spinner } from "../components/States";

export function JobDetailPage() {
  const { id } = useParams();
  const { data: job, isLoading, isError } = useJob(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [cover, setCover] = useState("");
  const [showApply, setShowApply] = useState(false);
  const [confirm, setConfirm] = useState(true);

  const { data: seekerProfile } = useQuery({
    queryKey: ["seeker-profile"],
    queryFn: profilesApi.seeker,
    enabled: user?.role === "job_seeker",
  });
  const hasResume = Boolean(seekerProfile?.resume);

  const apply = useMutation({
    mutationFn: () => applicationsApi.apply(job!.id, cover),
    onSuccess: () => {
      toast.success("Application submitted successfully. Your saved resume has been attached.");
      setShowApply(false);
      setCover("");
      qc.invalidateQueries({ queryKey: ["job", id] });
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["seeker-profile"] });
    },
    onError: (e) => {
      const msg = getApiError(e, "Could not apply");
      // Handle specific resume missing case
      if (msg.toLowerCase().includes("resume")) {
        toast.error("Please upload your resume in your profile before applying.");
      } else toast.error(msg);
    },
  });

  const save = useMutation({
    mutationFn: () => savedJobsApi.save(job!.id),
    onSuccess: () => {
      toast.success("Job saved");
      qc.invalidateQueries({ queryKey: ["job", id] });
      qc.invalidateQueries({ queryKey: ["saved-jobs"] });
    },
    onError: (e) => toast.error(getApiError(e, "Could not save job")),
  });

  if (isLoading) return <Spinner />;
  if (isError || !job) return <div className="container-page py-10"><ErrorState message="Job not found." /></div>;

  const salary =
    job.salary_min || job.salary_max
      ? `${job.salary_currency} ${(job.salary_min || 0).toLocaleString()} – ${(job.salary_max || 0).toLocaleString()}`
      : "Not disclosed";

  return (
    <div className="container-page grid gap-6 py-10 lg:grid-cols-[1fr_320px]">
      <Card className="p-6 sm:p-8">
        <p className="text-sm font-semibold text-brand-700">{job.company_detail.name}</p>
        <h1 className="mt-1 text-3xl font-bold">{job.title}</h1>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
          <span>{job.location}</span>
          <span>· {JOB_TYPE_LABEL[job.job_type]}</span>
          <span>· {EXPERIENCE_LABEL[job.experience_level]}</span>
          <span>· Posted {new Date(job.created_at).toLocaleDateString()}</span>
        </div>
        <section className="prose-sm mt-8 max-w-none">
          <h2 className="text-lg font-semibold">About the role</h2>
          <p className="mt-2 whitespace-pre-wrap text-slate-600">{job.description}</p>
          {job.requirements && (
            <>
              <h2 className="mt-6 text-lg font-semibold">Requirements</h2>
              <p className="mt-2 whitespace-pre-wrap text-slate-600">{job.requirements}</p>
            </>
          )}
          {job.benefits && (
            <>
              <h2 className="mt-6 text-lg font-semibold">Benefits</h2>
              <p className="mt-2 whitespace-pre-wrap text-slate-600">{job.benefits}</p>
            </>
          )}
        </section>
      </Card>
      <div className="space-y-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Salary</p>
          <p className="text-lg font-semibold">{salary}</p>
          <p className="mt-3 text-sm text-slate-500">{job.views_count} views</p>
          <div className="mt-4 space-y-2">
            {!user && (
              <Link to="/login">
                <Button className="w-full">Login to apply</Button>
              </Link>
            )}
            {user?.role === "job_seeker" && (
              <>
                {job.has_applied ? (
                  <Button className="w-full" disabled>
                    Applied
                  </Button>
                ) : seekerProfile && !hasResume ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
                    <p className="font-medium text-amber-800">Please upload your resume in your profile before applying.</p>
                    <Link to="/seeker/profile" className="mt-2 inline-block text-xs font-semibold text-brand-700 hover:underline">Go to profile →</Link>
                  </div>
                ) : (
                  <Button className="w-full" onClick={() => setShowApply(true)}>
                    Apply now
                  </Button>
                )}
                <Button variant="secondary" className="w-full" onClick={() => save.mutate()} disabled={job.is_saved || save.isPending}>
                  {job.is_saved ? "Saved" : "Save job"}
                </Button>
                {hasResume && !job.has_applied && (
                  <p className="text-xs text-slate-500 text-center">Your saved resume will be attached automatically.</p>
                )}
              </>
            )}
            {user?.role === "employer" && job.created_by === user.id && (
              <Button variant="secondary" className="w-full" onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}>
                Edit job
              </Button>
            )}
          </div>
        </Card>
        {showApply && (
          <Card className="p-5">
            <h3 className="font-semibold">Apply to {job.title}</h3>
            <p className="mt-1 text-xs text-slate-500">Your saved resume will be attached automatically.</p>
            {seekerProfile?.resume && (
              <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs">Attached: {decodeURIComponent(seekerProfile.resume.split("/").pop() || "resume")} ✓</p>
            )}
            {seekerProfile && !hasResume && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                No resume found. <Link to="/seeker/profile" className="font-semibold underline">Upload in profile</Link> before applying.
              </div>
            )}
            <TextArea label="Cover letter (optional)" className="mt-3" rows={5} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Why are you a good fit? (optional)" />
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="rounded border-slate-300" />
              <span>I confirm that I want to apply using my saved resume.</span>
            </label>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => apply.mutate()} disabled={apply.isPending || !confirm || (seekerProfile && !hasResume)}>
                {apply.isPending ? "Submitting…" : "Submit application"}
              </Button>
              <Button variant="ghost" onClick={() => setShowApply(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
