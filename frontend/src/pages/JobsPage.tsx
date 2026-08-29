import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useCategories, useJobs } from "../hooks/useJobs";
import { JobCard } from "../components/JobCard";
import { Input, Select } from "../components/Input";
import { Button } from "../components/Button";
import { EmptyState, ErrorState, Spinner } from "../components/States";

export function JobsPage() {
  const [params, setParams] = useSearchParams();
  const query = useMemo(
    () => ({
      search: params.get("search") || undefined,
      location: params.get("location") || undefined,
      category: params.get("category") || undefined,
      job_type: params.get("job_type") || undefined,
      experience_level: params.get("experience_level") || undefined,
      ordering: params.get("ordering") || "-created_at",
      page: params.get("page") || "1",
      page_size: 10,
    }),
    [params],
  );
  const { data, isLoading, isError } = useJobs(query);
  const { data: categories } = useCategories();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.set("page", "1");
    setParams(next);
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">Browse jobs</h1>
      <p className="mt-1 text-slate-500">Filter by category, type, experience, and location.</p>
      <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-6">
        <Input
          placeholder="Search"
          defaultValue={params.get("search") || ""}
          onBlur={(e) => update("search", e.target.value)}
        />
        <Input
          placeholder="Location"
          defaultValue={params.get("location") || ""}
          onBlur={(e) => update("location", e.target.value)}
        />
        <Select value={params.get("category") || ""} onChange={(e) => update("category", e.target.value)}>
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={params.get("job_type") || ""} onChange={(e) => update("job_type", e.target.value)}>
          <option value="">All types</option>
          <option value="full_time">Full-time</option>
          <option value="part_time">Part-time</option>
          <option value="internship">Internship</option>
          <option value="remote">Remote</option>
          <option value="contract">Contract</option>
        </Select>
        <Select value={params.get("experience_level") || ""} onChange={(e) => update("experience_level", e.target.value)}>
          <option value="">Any experience</option>
          <option value="intern">Intern</option>
          <option value="entry">Entry</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </Select>
        <Select value={params.get("ordering") || "-created_at"} onChange={(e) => update("ordering", e.target.value)}>
          <option value="-created_at">Newest</option>
          <option value="-salary_max">Salary: high to low</option>
          <option value="salary_min">Salary: low to high</option>
        </Select>
      </div>
      <div className="mt-8">
        {isLoading && <Spinner />}
        {isError && <ErrorState message="Could not load jobs. Is the API running?" />}
        {data && data.results.length === 0 && <EmptyState title="No jobs found" body="Try a different filter or keyword." />}
        <div className="grid gap-4">
          {data?.results.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        {data && data.count > 10 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant="secondary"
              disabled={!data.previous}
              onClick={() => update("page", String(Math.max(1, Number(params.get("page") || 1) - 1)))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={!data.next}
              onClick={() => update("page", String(Number(params.get("page") || 1) + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
