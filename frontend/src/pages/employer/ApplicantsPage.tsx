import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApplications } from "../../hooks/useApplications";
import { applicationsApi } from "../../services/endpoints";
import { getApiError } from "../../services/api";
import type { ApplicationStatus } from "../../types";
import { STATUS_LABEL } from "../../types";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { TextArea } from "../../components/Input";
import { EmptyState, Spinner } from "../../components/States";

export function ApplicantsPage() {
  const { id } = useParams();
  const { data, isLoading } = useApplications({ job: Number(id) });
  const qc = useQueryClient();
  const [notes, setNotes] = useState<Record<number, string>>({});
  const update = useMutation({
    mutationFn: ({ appId, status, employer_note }: { appId: number; status: ApplicationStatus; employer_note?: string }) =>
      applicationsApi.update(appId, { status, employer_note }),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  if (isLoading) return <Spinner />;
  if (!data?.results.length) return <EmptyState title="No applicants yet" body="Share the job to start receiving applications." />;

  return (
    <div>
      <h1 className="text-2xl font-bold">Applicants</h1>
      <div className="mt-4 space-y-3">
        {data.results.map((app) => (
          <Card key={app.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-[200px]">
                <p className="font-semibold">{app.seeker_detail.display_name}</p>
                <p className="text-sm text-slate-500">{app.seeker_detail.email} · {app.seeker_detail.phone || "no phone"}</p>
                {app.resume ? (
                  <a href={app.resume} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100">
                    View resume ({decodeURIComponent(app.resume.split("/").pop() || "resume")}) →
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">No resume attached (old application)</p>
                )}
                {app.cover_letter && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600"><span className="font-medium">Cover letter:</span> {app.cover_letter}</p>}
                {app.employer_note && <p className="mt-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">Note: {app.employer_note}</p>}
                <p className="mt-2 text-xs text-slate-400">Applied {new Date(app.created_at).toLocaleDateString()}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{STATUS_LABEL[app.status]}</span>
            </div>
            <div className="mt-4">
              <TextArea
                placeholder="Optional note to candidate (visible in API)"
                rows={2}
                value={notes[app.id] ?? app.employer_note ?? ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [app.id]: e.target.value }))}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["shortlisted", "rejected", "hired", "applied"] as ApplicationStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={app.status === status ? "primary" : "secondary"}
                  onClick={() => update.mutate({ appId: app.id, status, employer_note: notes[app.id] ?? app.employer_note })}
                  disabled={update.isPending}
                >
                  {STATUS_LABEL[status]}
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
