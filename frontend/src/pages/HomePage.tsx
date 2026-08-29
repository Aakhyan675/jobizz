import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "../services/endpoints";
import { JobCard } from "../components/JobCard";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Spinner } from "../components/States";

export function HomePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["featured-jobs"], queryFn: jobsApi.featured });

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("search", keyword);
    if (location) params.set("location", location);
    navigate(`/jobs?${params.toString()}`);
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-indigo-500 text-white">
        <div className="container-page grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-100">Nepal’s modern job board</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Find your next job with Jobizz</h1>
            <p className="mt-4 max-w-xl text-brand-50">
              Search verified roles, apply in minutes, and hire the right people — a cleaner take on the Mero Job experience.
            </p>
            <form onSubmit={onSearch} className="mt-8 grid gap-3 rounded-2xl bg-white p-3 text-slate-800 shadow-card sm:grid-cols-[1fr_1fr_auto]">
              <Input placeholder="Keyword, skill, or title" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
              <Input placeholder="Location (e.g. Kathmandu)" value={location} onChange={(e) => setLocation(e.target.value)} />
              <Button type="submit" className="h-[42px]">
                Search
              </Button>
            </form>
          </div>
          <div className="hidden rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur md:block">
            <p className="text-sm text-brand-100">Why Jobizz</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>Role-based dashboards for seekers and employers</li>
              <li>Save jobs, track application status, shortlist talent</li>
              <li>Filters for category, type, experience, and location</li>
            </ul>
          </div>
        </div>
      </section>
      <section className="container-page py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Latest jobs</h2>
            <p className="text-sm text-slate-500">Fresh openings from Nepali employers</p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/jobs")}>
            View all
          </Button>
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data?.results.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
