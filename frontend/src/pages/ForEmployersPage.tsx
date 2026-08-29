import { Link } from "react-router-dom";
import { Button } from "../components/Button";

export function ForEmployersPage() {
  return (
    <div className="container-page py-16">
      <p className="text-sm font-semibold text-brand-700">For employers</p>
      <h1 className="mt-2 max-w-2xl text-4xl font-bold">Hire faster with a clear applicant pipeline</h1>
      <p className="mt-4 max-w-2xl text-slate-600">
        Post roles, collect applications, and shortlist candidates without the clutter. Jobizz gives hiring teams a focused dashboard.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/register">
          <Button>Create employer account</Button>
        </Link>
        <Link to="/login">
          <Button variant="secondary">Login</Button>
        </Link>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          ["Post jobs", "Publish full-time, remote, internship, and contract roles."],
          ["Review applicants", "Change status to shortlisted, rejected, or hired with notes."],
          ["Company profile", "Show your brand, industry, and location to seekers."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-slate-500">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
