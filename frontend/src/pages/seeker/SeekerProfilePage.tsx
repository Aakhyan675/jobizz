import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi, profilesApi } from "../../services/endpoints";
import { getApiError } from "../../services/api";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input, TextArea } from "../../components/Input";
import { Spinner } from "../../components/States";
import { useAuth } from "../../context/AuthContext";

function fileSizeLabel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ChipInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  function addSkill(raw: string) {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const next = [...value];
    for (const p of parts) if (!next.includes(p) && next.length < 20) next.push(p);
    onChange(next);
    setInput("");
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        {value.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {s}
            <button type="button" aria-label={`Remove ${s}`} onClick={() => onChange(value.filter((x) => x !== s))} className="ml-1 text-brand-400 hover:text-brand-700">×</button>
          </span>
        ))}
        <input
          placeholder={value.length ? "Add more…" : "Type a skill and press Enter"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addSkill(input);
            }
            if (e.key === "Backspace" && !input && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => addSkill(input)}
          className="flex-1 min-w-[120px] bg-transparent py-1 text-sm outline-none"
        />
      </div>
      <p className="mt-1 text-xs text-slate-400">Optional — press Enter or comma to add. Up to 20 skills.</p>
    </div>
  );
}

export function SeekerProfilePage() {
  const { refreshUser } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["seeker-profile"], queryFn: profilesApi.seeker });
  const { register, handleSubmit, reset, watch, setValue } = useForm<Record<string, string>>();
  const [skills, setSkills] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeRemoved, setResumeRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!data) return;
    reset({
      first_name: data.user.first_name,
      last_name: data.user.last_name,
      phone: data.user.phone,
      location: data.location,
      headline: (data as unknown as { headline?: string }).headline || "",
      bio: data.bio,
      linkedin_url: (data as unknown as { linkedin_url?: string }).linkedin_url || "",
      portfolio_url: (data as unknown as { portfolio_url?: string }).portfolio_url || "",
    });
    setSkills(data.skills || []);
    setSelectedFile(null);
    setResumeRemoved(false);
  }, [data, reset]);

  const currentResumeUrl = resumeRemoved ? null : data?.resume || null;
  const currentResumeName = currentResumeUrl ? decodeURIComponent(currentResumeUrl.split("/").pop() || "resume") : null;

  function handleFile(file: File | null) {
    if (!file) return;
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error("Only PDF, DOC, DOCX allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be 5 MB or smaller.");
      return;
    }
    setSelectedFile(file);
    setResumeRemoved(false);
  }

  const save = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      // Update user basic info
      await authApi.updateMe({
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
      } as never);
      const form = new FormData();
      form.append("location", values.location || "");
      form.append("headline", values.headline || "");
      form.append("bio", values.bio || "");
      form.append("linkedin_url", values.linkedin_url || "");
      form.append("portfolio_url", values.portfolio_url || "");
      form.append("skills", JSON.stringify(skills));
      if (selectedFile) form.append("resume", selectedFile);
      // Do not send resume field when only removing — keep existing until replaced (avoids empty-string validation)
      // Education/experience are NOT sent from normal UI (Option A: resume is source of truth)
      await profilesApi.updateSeeker(form);
    },
    onSuccess: async () => {
      toast.success("Profile saved");
      await refreshUser();
      qc.invalidateQueries({ queryKey: ["seeker-profile"] });
      setSelectedFile(null);
      setResumeRemoved(false);
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your profile</h1>
        <p className="text-sm text-slate-500">Keep your info up to date. Your saved resume will be automatically attached when you apply.</p>
      </div>

      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-6">
        {/* Personal Information */}
        <Card className="p-6">
          <h2 className="font-semibold">Personal Information</h2>
          <p className="text-xs text-slate-400">Who you are — employers see this on your application.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="First name" {...register("first_name")} />
            <Input label="Last name" {...register("last_name")} />
            <Input label="Phone" placeholder="+977 9800..." {...register("phone")} />
            <Input label="Location" placeholder="Kathmandu, Nepal" {...register("location")} />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <span>Email:</span>
            <span className="font-medium text-slate-700">{data?.user.email}</span>
            <span className="text-slate-400">(read-only)</span>
          </div>
        </Card>

        {/* Professional Summary */}
        <Card className="p-6">
          <h2 className="font-semibold">Professional Summary</h2>
          <div className="mt-4 grid gap-4">
            <Input label="Professional headline" placeholder="Junior Full-Stack Developer" {...register("headline")} />
            <TextArea label="Short bio / professional summary" rows={4} placeholder="2–3 lines about your strengths and what you’re looking for…" {...register("bio")} />
            <div>
              <label className="block text-sm font-medium text-slate-700">Skills (optional)</label>
              <div className="mt-2">
                <ChipInput value={skills} onChange={setSkills} />
              </div>
            </div>
          </div>
        </Card>

        {/* Resume / CV */}
        <Card className="p-6">
          <h2 className="font-semibold">Resume / CV</h2>
          <p className="mt-1 text-sm text-slate-500">Upload your latest resume once. It will be automatically attached when you apply for jobs. Accepted: PDF, DOC, DOCX — max 5 MB.</p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            className={`mt-4 rounded-2xl border-2 border-dashed p-6 text-center transition ${dragOver ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-slate-50"}`}
          >
            <p className="text-sm font-medium">Drag & drop your resume here</p>
            <p className="mt-1 text-xs text-slate-500">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
            <Button type="button" variant="secondary" className="mt-3" onClick={() => fileInputRef.current?.click()}>
              Browse files
            </Button>
            <p className="mt-2 text-xs text-slate-400">PDF, DOC, DOCX — 5 MB max</p>
          </div>

          {/* Current / selected file info */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            {selectedFile ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{selectedFile.name.split(".").pop()?.toUpperCase()} • {fileSizeLabel(selectedFile.size)} • will be uploaded on Save</p>
                </div>
                <button type="button" onClick={() => setSelectedFile(null)} className="text-sm text-rose-600 hover:underline">Remove</button>
              </div>
            ) : currentResumeUrl ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{currentResumeName}</p>
                  <p className="text-xs text-slate-500">Current resume on file — upload a new file above to replace</p>
                </div>
                <a href={currentResumeUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">View / Download</a>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No resume uploaded yet. Please upload before applying — employers will see the file you attach at application time.</p>
            )}
          </div>
        </Card>

        {/* Optional Links */}
        <Card className="p-6">
          <h2 className="font-semibold">Optional Links</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/you" {...register("linkedin_url")} />
            <Input label="Portfolio / GitHub URL" placeholder="https://github.com/you" {...register("portfolio_url")} />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save profile"}
          </Button>
          {data?.resume && !selectedFile && !resumeRemoved && <span className="self-center text-xs text-slate-500">Current file will be kept unless you replace it</span>}
        </div>
      </form>
    </div>
  );
}
