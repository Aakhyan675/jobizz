import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div>
          <p className="text-lg font-bold">Jobizz</p>
          <p className="mt-2 text-sm text-slate-500">
            A modern job board for Nepal — connect seekers with employers.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Seekers</p>
          <Link className="mt-2 block text-sm text-slate-500 hover:text-brand-700" to="/jobs">
            Browse jobs
          </Link>
          <Link className="mt-1 block text-sm text-slate-500 hover:text-brand-700" to="/register">
            Create profile
          </Link>
        </div>
        <div>
          <p className="text-sm font-semibold">Employers</p>
          <Link className="mt-2 block text-sm text-slate-500 hover:text-brand-700" to="/employers">
            Post a job
          </Link>
          <Link className="mt-1 block text-sm text-slate-500 hover:text-brand-700" to="/register">
            Hire talent
          </Link>
        </div>
        <div>
          <p className="text-sm font-semibold">Company</p>
          <p className="mt-2 text-sm text-slate-500">Kathmandu, Nepal</p>
          <p className="mt-1 text-sm text-slate-500">hello@jobizz.dev</p>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Jobizz. Built as a portfolio job platform.
      </div>
    </footer>
  );
}
