import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { dashboardPath, useAuth } from "../context/AuthContext";
import { Button } from "./Button";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "text-brand-700 bg-brand-50" : "text-slate-600 hover:text-slate-900"}`;

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm text-white">J</span>
          Jobizz
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/jobs" className={linkClass}>
            Jobs
          </NavLink>
          <NavLink to="/employers" className={linkClass}>
            For Employers
          </NavLink>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="relative">
              <button
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                onClick={() => setMenu((v) => !v)}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-xs text-brand-700">
                  {user.display_name.slice(0, 1).toUpperCase()}
                </span>
                {user.display_name}
                <span className="text-xs text-slate-400 capitalize">({user.role})</span>
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-card">
                  {user.role === "admin" && (
                    <>
                      <Link className="block px-3 py-2 text-sm hover:bg-slate-50" to="/admin/dashboard" onClick={() => setMenu(false)}>
                        Admin Dashboard
                      </Link>
                      <a className="block px-3 py-2 text-sm hover:bg-slate-50" href="/admin/" target="_blank" rel="noreferrer">
                        Django Admin
                      </a>
                    </>
                  )}
                  {user.role === "job_seeker" && (
                    <>
                      <Link className="block px-3 py-2 text-sm hover:bg-slate-50" to="/seeker/dashboard" onClick={() => setMenu(false)}>
                        Dashboard
                      </Link>
                      <Link className="block px-3 py-2 text-sm hover:bg-slate-50" to="/seeker/saved-jobs" onClick={() => setMenu(false)}>
                        Saved Jobs
                      </Link>
                      <Link className="block px-3 py-2 text-sm hover:bg-slate-50" to="/seeker/applications" onClick={() => setMenu(false)}>
                        Applications
                      </Link>
                      <Link className="block px-3 py-2 text-sm hover:bg-slate-50" to="/seeker/profile" onClick={() => setMenu(false)}>
                        Profile
                      </Link>
                    </>
                  )}
                  {user.role === "employer" && (
                    <>
                      <Link className="block px-3 py-2 text-sm hover:bg-slate-50" to="/employer/dashboard" onClick={() => setMenu(false)}>
                        Dashboard
                      </Link>
                      <Link className="block px-3 py-2 text-sm hover:bg-slate-50" to="/employer/jobs" onClick={() => setMenu(false)}>
                        My Jobs
                      </Link>
                      <Link className="block px-3 py-2 text-sm hover:bg-slate-50" to="/employer/jobs/new" onClick={() => setMenu(false)}>
                        Post Job
                      </Link>
                      <Link className="block px-3 py-2 text-sm hover:bg-slate-50" to="/employer/company" onClick={() => setMenu(false)}>
                        Company Profile
                      </Link>
                    </>
                  )}
                  {/* Fallback generic dashboard link for any role */}
                  {!["admin", "job_seeker", "employer"].includes(user.role) && (
                    <Link className="block px-3 py-2 text-sm hover:bg-slate-50" to={dashboardPath(user.role)} onClick={() => setMenu(false)}>
                      Dashboard
                    </Link>
                  )}
                  <button
                    className="block w-full border-t border-slate-100 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                    onClick={async () => {
                      await logout();
                      setMenu(false);
                      navigate("/");
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-700">
                Login
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          <span className="text-2xl leading-none">☰</span>
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 px-4 py-3 md:hidden">
          <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/jobs" className={linkClass} onClick={() => setOpen(false)}>
            Jobs
          </NavLink>
          <NavLink to="/employers" className={linkClass} onClick={() => setOpen(false)}>
            For Employers
          </NavLink>
          {user ? (
            <>
              {user.role === "admin" && (
                <Link className="block px-3 py-2 text-sm" to="/admin/dashboard" onClick={() => setOpen(false)}>
                  Admin Dashboard
                </Link>
              )}
              {user.role === "job_seeker" && (
                <>
                  <Link className="block px-3 py-2 text-sm" to="/seeker/dashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                  <Link className="block px-3 py-2 text-sm" to="/seeker/saved-jobs" onClick={() => setOpen(false)}>
                    Saved Jobs
                  </Link>
                  <Link className="block px-3 py-2 text-sm" to="/seeker/applications" onClick={() => setOpen(false)}>
                    Applications
                  </Link>
                  <Link className="block px-3 py-2 text-sm" to="/seeker/profile" onClick={() => setOpen(false)}>
                    Profile
                  </Link>
                </>
              )}
              {user.role === "employer" && (
                <>
                  <Link className="block px-3 py-2 text-sm" to="/employer/dashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                  <Link className="block px-3 py-2 text-sm" to="/employer/jobs" onClick={() => setOpen(false)}>
                    My Jobs
                  </Link>
                  <Link className="block px-3 py-2 text-sm" to="/employer/jobs/new" onClick={() => setOpen(false)}>
                    Post Job
                  </Link>
                  <Link className="block px-3 py-2 text-sm" to="/employer/company" onClick={() => setOpen(false)}>
                    Company Profile
                  </Link>
                </>
              )}
              <button
                className="block px-3 py-2 text-sm text-rose-600"
                onClick={async () => {
                  await logout();
                  setOpen(false);
                  navigate("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <div className="mt-2 flex gap-2">
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button variant="secondary">Login</Button>
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                <Button>Register</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
