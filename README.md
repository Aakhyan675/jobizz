# Jobizz — Professional Job Search Platform (Mero Job–style MVP)

A clean, modern, production-ready job board inspired by Nepal's **Mero Job**. Job seekers browse and apply; employers post jobs and manage applicants. Built as a portfolio project demonstrating full-stack skills with **Django + DRF** and **React + Vite**.

---

## ✨ Features

### Public
- **Home** — hero ("Find your next job with Jobizz"), keyword + location search, latest/featured jobs
- **Jobs listing** — pagination (10/page), filters (category, job type, experience, location), full-text search, sort by newest / salary
- **Job detail** — title, company, location, type, description, requirements, benefits, salary range, posted date, views, `Apply Now` / `Login to apply`

### Auth & Roles
- `job_seeker`, `employer`, `admin` (custom user model, email as `USERNAME_FIELD`)
- Register / Login / Logout / Token refresh (JWT `simplejwt`, refresh rotation + blacklist)
- Password reset flow: request → email (console backend in dev) → confirm with `uid`/`token` (also returns `debug_reset_url` when `DEBUG=True`)

### Job Seeker
- Dashboard: applications count, saved jobs count, by-status breakdown
- Profile (reworked, no raw JSON):
  - Personal: first name, last name, phone, location, email (read-only)
  - Professional: headline (e.g. “Junior Full-Stack Developer”), short bio/summary, **skills as chip input (optional)**
  - **Resume/CV upload (required before applying)**: PDF/DOC/DOCX, 5 MB max, drag-and-drop, View/Download link
  - Optional links: LinkedIn URL, Portfolio/GitHub URL
  - *Education/experience JSON fields kept in DB for backwards compat but hidden from normal UI — resume is source of truth (Option A).*
- Resume snapshot: when applying, saved profile resume is **automatically copied** to `JobApplication.resume` (`submitted_resumes/`), so later profile changes don’t affect past applications.
- Actions: search & filter jobs, **clickable JobCards** (`/jobs/:id`), view detail, **save/unsave**, **apply (cover letter optional + “I confirm using my saved resume”)** with `Please upload your resume` prompt if missing, track status (`applied`, `shortlisted`, `rejected`, `hired`), duplicate-apply blocked.
- Home page: `GET /api/jobs/?page_size=6` featured/latest jobs, every card is `Link to /jobs/:id` with hover/ focus ring + logo fallback.

### Employer
- Dashboard: jobs count, published count, total views, applicants count, by-status
- Company profile: name, logo (image 2MB), website, industry, size, location, description
- Job management: **create / edit / publish/unpublish / delete** (only own jobs); list applicants
- Applicants: filter by `job`, change status + optional `employer_note`, **View resume snapshot** (`GET /api/applications/` includes `resume` URL — only visible to job owner + admin + seeker themselves)

### Admin
- Full **Django Admin** at `/admin/` for Users, Seeker/Employer profiles, Companies, Categories, Jobs, Applications, SavedJobs
- Frontend **Admin Dashboard** at `/admin/dashboard` (protected `GET /api/admin/stats/`)

### Resume & Media
- **Storage**: `SeekerProfile.resume` → `MEDIA_ROOT/resumes/`, `JobApplication.resume` → `MEDIA_ROOT/submitted_resumes/` (snapshot copy via `ContentFile`), local `FileSystemStorage` (`MEDIA_URL=/media/` served via `static()` in `DEBUG`).
- **Validation**: `core/validators.py:4` `validate_resume_file` — extensions `.pdf/.doc/.docx`, MIME check via extension, **5 MB max** (configurable via validator). Tested: invalid type → 400, oversize → 400.
- **Access**: In `DEBUG` media is public via `/media/`; in production use **private object storage** (S3/GCS) or protected download endpoint — current snapshot ensures employer still sees submitted file even if seeker later replaces profile resume. README note: add auth check on `/media/` or use signed URLs for production.
- **Upload UI**: `SeekerProfilePage.tsx` — drag-and-drop zone + Browse, shows file name/type/size, View/Download link, Replace flow; `multipart/form-data` PATCH to `/api/seeker-profile/`; seeker page shows “Upload your latest resume once. It will be automatically attached when you apply.”

---

## 🧱 Tech Stack

| Layer | Choice |
|-------|--------|
| Backend | Python (3.12), Django 5.1, Django REST Framework 3.15, `djangorestframework-simplejwt`, `django-filter`, `django-cors-headers`, `django-environ`, `Pillow` |
| DB | PostgreSQL 16 (Docker) — tests fall back to SQLite + MD5 hasher |
| Auth | JWT (access 30m, refresh 7d, rotation + blacklist) |
| Frontend | React 19, Vite 6, TypeScript 5, Tailwind 3, `react-router-dom` 7, `@tanstack/react-query` 5, `axios`, `react-hook-form`, `sonner` (toasts) |
| Deploy | Backend: Render / Railway via `gunicorn + WhiteNoise`; Frontend: Vercel / Netlify (SPA rewrite) |

---

## 📁 Folder Structure

```
jobizz/
├── backend/
│   ├── jobizz/            # project + settings/{base,dev,prod,test}
│   ├── accounts/          # User (custom), SeekerProfile, EmployerProfile, auth views, dashboard stats
│   ├── companies/         # Company
│   ├── jobs/              # JobCategory, Job, JobApplication, SavedJob + filters, seed commands
│   ├── core/              # permissions, pagination, validators
│   ├── manage.py
│   └── requirements*.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Navbar, Layout, JobCard, Button, Input, States, DashboardShell
│   │   ├── pages/         # Home, Jobs, JobDetail, Login, Register, Forgot/Reset, seeker/*, employer/*
│   │   ├── context/       # AuthContext (JWT storage, me() hydration)
│   │   ├── services/      # api.ts (axios + refresh interceptor), endpoints.ts
│   │   ├── hooks/         # useJobs, useApplications, useDashboardStats
│   │   ├── types/         # TS interfaces + label maps
│   │   └── App.tsx
│   ├── vite.config.ts
│   └── package.json
├── docker-compose.yml      # postgres:16-alpine
├── render.yaml
└── README.md
```

---

## 🔌 API Guideline

All endpoints are under `/api/` (see `backend/jobizz/urls.py` + app `urls.py`).

### Auth (`/api/auth/`)
| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/auth/register/` | `{email,password,password_confirm,first_name,last_name,phone,role}` role must be `job_seeker` or `employer` (never `admin`) → `201 {message:"Account created successfully.", user, access, refresh}` |
| POST | `/api/auth/login/` | `{email,password}` → `{access,refresh,user}` (`JobizzTokenObtainPairSerializer` adds `role` to token) |
| POST | `/api/auth/logout/` | `{refresh}` blacklists token |
| POST | `/api/auth/token/refresh/` | `{refresh}` → new `{access,refresh}` |
| POST | `/api/auth/password-reset/` | `{email}` → 200 (prints reset link in DEBUG) |
| POST | `/api/auth/password-reset/confirm/` | `{uid,token,new_password}` |

Also aliased: `GET/PATCH /api/me/` (also `/api/auth/me/` returns `role`) and `GET /api/dashboard/` (role-aware). Admin stats: `GET /api/admin/stats/` (admin only, see below).

Supported `role` values: `job_seeker` (redirect → `/seeker/dashboard`), `employer` (→ `/employer/dashboard`), `admin` (→ `/admin/dashboard`, created via `createsuperuser` or `seed_demo`, not public registration).

### Users / Profiles
| Method | Path |
|--------|------|
| GET/PATCH | `/api/me/` |
| GET/PATCH | `/api/seeker-profile/` (IsJobSeeker) |
| GET/PATCH | `/api/employer-profile/` (IsEmployer) |
| CRUD | `/api/companies/` (create/update/delete = IsEmployer + IsOwnerOrReadOnly) |

### Jobs
| Method | Path | Query params |
|--------|------|--------------|
| GET | `/api/jobs/` | `search`, `category` (slug), `category_id`, `location`, `job_type`, `experience_level`, `company`, `mine=true`, `ordering` (`-created_at`,`salary_min`,…), `page`,`page_size` |
| GET | `/api/jobs/{id}/` | Increments `views_count` if published or owner |
| POST | `/api/jobs/` | employer only; `company` auto-filled from employer profile if omitted |
| PATCH/DELETE | `/api/jobs/{id}/` | owner only |
| POST | `/api/jobs/{id}/publish/`, `/unpublish/` | owner only |
| GET | `/api/categories/` | read-only |

### Applications & Saved Jobs
| Method | Path |
|--------|------|
| GET/POST | `/api/applications/` (POST = IsJobSeeker, filter `?job=&status=`) |
| PATCH | `/api/applications/{id}/` (employer may change `status` (`applied`,`reviewed`,`shortlisted`,`rejected`,`hired`) + `employer_note`; seeker sees own) |
| GET/POST/DELETE | `/api/saved-jobs/` (IsJobSeeker) `DELETE /api/saved-jobs/{id}/` |

### Admin (`/api/admin/`)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/admin/stats/` | Admin only (`IsAdminRole`) → `{total_users,seekers,employers,admins,total_jobs,active_jobs,expired_jobs,total_applications,recent_jobs,recent_users,by_status,jobs_by_category}` |

Pagination: `DefaultPagination` (`page`, `page_size` max 50, default 10). Frontend uses `Paginated<T>`.

---

## 🚀 Local Setup

### Prereqs
- **Python** `3.12.8` (see `backend/runtime.txt`)
- **Node** `20+` recommended (Vite 6)
- **PostgreSQL 16** via Docker (or local Postgres)
- Git

### Backend

```powershell
cd backend

# 1. Create env
copy .env.example .env
# edit .env if needed (defaults work with docker-compose)
# For local without Docker, set in .env: DJANGO_SETTINGS_MODULE=jobizz.settings.test  (uses SQLite test.sqlite3)

# 2. Python env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# optional: pip install -r requirements-dev.txt  # for pytest

# 3. Start Postgres (Docker) — skip if using SQLite fallback
docker compose up -d   # from repo root, or: docker compose -f ../docker-compose.yml up -d
# If Docker not installed, keep DJANGO_SETTINGS_MODULE=jobizz.settings.test

# 4. Migrate & seed (use --settings flag if using SQLite)
python manage.py migrate --settings=jobizz.settings.test   # or plain `python manage.py migrate` with Postgres
python manage.py seed_categories --settings=jobizz.settings.test
python manage.py seed_demo --settings=jobizz.settings.test   # creates 4 companies, 12 jobs, demo users (see below)
# Or with Postgres: python manage.py migrate; python manage.py seed_categories; python manage.py seed_demo

# 5. Create admin (if not using seed_demo)
python manage.py createsuperuser --settings=jobizz.settings.test
# Prompts for email/password; then `python manage.py shell` → user.role='admin' if needed, or use Django admin

# 6. Run dev server
python manage.py runserver --settings=jobizz.settings.test 0.0.0.0:8000
# or: python manage.py runserver  (with Postgres)
# API at http://localhost:8000/api  (try http://127.0.0.1:8000/api if localhost fails)
# Admin at http://localhost:8000/admin
```

Without Docker: set `POSTGRES_HOST`, `POSTGRES_DB`, etc. in `.env` to point to your local Postgres, or set `DJANGO_SETTINGS_MODULE=jobizz.settings.test` to use SQLite (tests do this automatically).

### Frontend

```powershell
cd frontend

# 1. Env
copy .env.example .env
# VITE_API_URL=http://localhost:8000/api  (default)
# Alias supported: VITE_API_BASE_URL=http://127.0.0.1:8000/api  (either works)
# Must point to Django backend, NOT Vite (5173). Check Network tab: POST should go to 8000/api/auth/register/

# 2. Install & run
npm install
npm run dev    # http://localhost:5173  (or http://127.0.0.1:5173)
# If 5173 busy: npm run dev -- --port 5174

# 3. Build check
npm run build  # runs tsc -b && vite build
npm run preview
```

---

## 🔑 Test Credentials (after `seed_demo`)

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Seeker | `seeker@jobizz.dev` | `Jobizz123!` | Profile: Sita Sharma, React skills |
| Employer | `employer@jobizz.dev` | `Jobizz123!` | Owns Himalayan Tech + Kathmandu Finance |
| Employer 2 | `employer2@jobizz.dev` | `Jobizz123!` | Owns Everest Hospitality + Patan Design Studio |
| Admin | `admin@jobizz.dev` | `Jobizz123!` | `is_staff` + `is_superuser` → Django admin |

Also: categories seeded via `seed_categories` (10 total). Jobs: 12 across IT, Design, Finance, HR, Engineering, etc.

**Flows to demo:**
- **Seeker**: Register → Browse `/jobs` with filters → Save job → `Apply now` (cover letter optional) → Check `/seeker/applications` status.
- **Employer**: Register as employer → `/employer/company` create company → `Post job` → `/employer/jobs` manage → `Applicants` → Shortlist/Reject + note.

---

## 🌐 Deployment Notes (high-level)

### Backend (Render / Railway)
1. Set env vars from `backend/.env.example`: `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `FRONTEND_URL`, `POSTGRES_*`, `DJANGO_SETTINGS_MODULE=jobizz.settings.prod`.
2. Build command (see `render.yaml`): `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
3. Start: `gunicorn jobizz.wsgi:application` (`Procfile`).
4. Ensure `SECURE_PROXY_SSL_HEADER` + `SECURE_SSL_REDIRECT` (prod settings) and `STATIC_ROOT` via WhiteNoise.
5. Media: local `FileSystemStorage` (`/media/`) works for MVPs; swap to S3/Cloudinary for persistence on ephemeral hosts.

### Frontend (Vercel / Netlify)
- Both have SPA rewrite configured (`frontend/vercel.json` / `netlify.toml`).
- Set `VITE_API_URL` to your deployed API base (e.g. `https://your-api.onrender.com/api`).
- Build: `npm run build` → `dist/`.
- Env: only `VITE_API_URL` required.

### CORS
- Backend reads `CORS_ALLOWED_ORIGINS` from env, includes `http://localhost:5173` by default.
- Add your deployed frontend origin (Vercel/Netlify URL) to that list + `CSRF_TRUSTED_ORIGINS` if you use credentials.

---

## 🧪 Testing

```powershell
# Backend (uses SQLite + MD5 hasher for speed)
cd backend
pip install -r requirements-dev.txt
python -m pytest -q            # 3 tests: auth flow + job/application lifecycle
# or: python manage.py test

# Frontend
cd frontend
npm run build                  # type-check + production build
```

Manual checks: browse pagination, filtering, salary ordering; verify JWT refresh (wait 30m or tamper access token); confirm employer cannot edit another employer's job and seeker cannot patch application status (enforced via `core.permissions`).

---

## 🔧 Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| **Django backend not running** → Register shows “Cannot reach the server” / Network error, no toast | Backend not started, wrong port | Run `python manage.py runserver --settings=jobizz.settings.test 0.0.0.0:8000` in `backend/`, check `http://localhost:8000/api/jobs/` returns JSON; check firewall/antivirus |
| **Wrong VITE_API_BASE_URL** → Network tab shows `POST http://localhost:5173/api/auth/register/` 404 | Frontend calls Vite instead of Django | Set `frontend/.env` to `VITE_API_URL=http://localhost:8000/api` (or `http://127.0.0.1:8000/api`), restart `npm run dev`; `api.ts` now checks both `VITE_API_URL` and `VITE_API_BASE_URL` |
| **CORS errors** → Console `CORS header ‘Access-Control-Allow-Origin’ missing` | `CORS_ALLOWED_ORIGINS` missing your origin | Add `http://localhost:5173` and `http://127.0.0.1:5173` to `backend/.env` `CORS_ALLOWED_ORIGINS`, restart Django; `django-cors-headers` `corsheaders.middleware.CorsMiddleware` must be before `CommonMiddleware` (it is in `base.py:41`) |
| **PostgreSQL / database error** → `connection timeout` / `no such table` | No Postgres or migrations not run | With Docker: `docker compose up -d` then `python manage.py migrate`; Without Docker: use SQLite fallback `DJANGO_SETTINGS_MODULE=jobizz.settings.test` and `python manage.py migrate --settings=jobizz.settings.test`; delete stale `test.sqlite3` (0-byte) if needed then re-migrate + `seed_demo` |
| **Registration validation error** → `400 {email: [...]}` no visible message | Frontend swallowed error | Fixed: `getApiError` now surfaces `email: user with this email already exists.`, `password_confirm: Passwords do not match.`, and `detail`; Register/Login pages show inline `<Input error>` + top alert + `toast.error` with `isSubmitting` spinner “Creating your account…” |
| **Password mismatch / weak password** | Client validation missing | Register now validates `password !== password_confirm` and `length>=8` before API call, shows strength meter, `Show`/`Hide` toggle; backend validates via `django.contrib.auth.password_validation` |
| **Role protection** → seeker sees employer page | `ProtectedRoute` not enforced | `App.tsx` now uses `<ProtectedRoute allowedRoles={["job_seeker"]}>` etc; backend `IsAdminRole`/`IsEmployer`/`IsJobSeeker` enforce same; test via `curl -H "Authorization: Bearer <seeker_token>" http://localhost:8000/api/admin/stats/` → 403 |

## 🔒 Permissions Summary

- `IsJobSeeker` / `IsEmployer` gate `SavedJob` + `JobApplication.create`.
- `JobViewSet`: `list/retrieve` public; `create/update/destroy/publish` require `IsEmployer` + owner check (`created_by`).
- `CompanyViewSet`: public reads; writes require `IsEmployer` + `IsOwnerOrReadOnly` (plus block deleting a company with jobs).
- `JobApplicationViewSet`: seekers see `seeker=user`; employers see `job__created_by=user`; seekers blocked from `PATCH status` in serializer.

---

## 📝 Env Examples

See `backend/.env.example` and `frontend/.env.example`. Key vars:

**Backend `.env`**
```
DJANGO_SETTINGS_MODULE=jobizz.settings.dev
DJANGO_SECRET_KEY=change-me-in-development-only
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
POSTGRES_DB=jobizz
POSTGRES_USER=jobizz
POSTGRES_PASSWORD=jobizz
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
FRONTEND_URL=http://localhost:5173
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=Jobizz <noreply@jobizz.local>
```

**Frontend `.env`**
```
VITE_API_URL=http://localhost:8000/api
# or VITE_API_BASE_URL=http://127.0.0.1:8000/api  (both supported, see frontend/src/services/api.ts:30)
```

---

## 🛠️ What changed (full fix 2026-08-29)

- **Auth pipeline fix**: `RegisterView` now returns `201 {message, user, access, refresh}` `accounts/views.py:23`; `JobizzTokenObtainPairSerializer` includes `role`; `AuthContext` `dashboardPath` maps `job_seeker→/seeker/dashboard`, `employer→/employer/dashboard`, `admin→/admin/dashboard`; `LoginPage`/`RegisterPage` now show `isSubmitting` spinner “Creating your account…”, inline validation + top alert, `getApiError` surfaces `email`/`password` field errors, network-offline friendly message, never logs passwords/tokens.
- **API URL/CORS**: `frontend/src/services/api.ts:30` checks `VITE_API_URL || VITE_API_BASE_URL`; `backend/jobizz/settings/base.py:30` `corsheaders` correctly ordered, `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173,http://127.0.0.1:5173`; `.env.example` documents both.
- **Role ecosystem**: `User.role` `job_seeker/employer/admin` + `IsAdminRole`; `AdminStatsView` `accounts/dashboard.py:37` at `GET /api/admin/stats/` (admin only); `ProtectedRoute` supports `allowedRoles` `frontend/src/components/ProtectedRoute.tsx:7`; `App.tsx` protects `/seeker/dashboard` etc + `/admin/dashboard`; `Navbar` role-aware dropdown; `JobDetailPage` gates Apply/Save to seekers, Post/Manage to employers.
- **Admin dashboard**: New `frontend/src/pages/admin/AdminDashboardPage.tsx` with stat cards + recent jobs/users + loading/error/empty states.
- **Design**: New two-column `RegisterPage`/`LoginPage` with role cards (“I’m looking for a job” → `job_seeker`), password Show/Hide + strength meter, gradient branding, responsive.
- **DB fix**: Created missing migrations (`accounts/0001`, `accounts/0002_employerprofile_company`, `companies/0001`, `jobs/0001` fixing circular `accounts↔companies`); `seed_demo` → 4 companies/12 jobs; SQLite fallback via `jobizz.settings.test` for non-Docker local.

Previous scaffold fixes:

- Fixed `SeekerOverviewPage` incorrect import paths (`../hooks` → `../../hooks`) and `RegisterPage` TS cast for `Form → Record<string,string>` (build-breaking).
- Enhanced `SeekerProfileSerializer` to parse `education`/`experience` JSON strings from `multipart/form-data` (previously would store raw strings); frontend `SeekerProfilePage` now edits those fields as JSON.
- `ApplicantsPage` now supports `employer_note` alongside status changes (API already allowed it).
- Enriched `seed_demo` from 1 company / 3 jobs to **4 companies / 12 jobs** with varied categories, types, locations + second employer/admin + richer seeker profile so the site isn't empty on first run.
- Verified end-to-end build: `pip -r requirements-dev` + `pytest 3 passed` + `npm run build` ok.

## 🛠️ What changed from the CursorAI scaffold (legacy)

- Fixed `SeekerOverviewPage` incorrect import paths (`../hooks` → `../../hooks`) and `RegisterPage` TS cast for `Form → Record<string,string>` (build-breaking).
- Enhanced `SeekerProfileSerializer` to parse `education`/`experience` JSON strings from `multipart/form-data` (previously would store raw strings); frontend `SeekerProfilePage` now edits those fields as JSON.
- `ApplicantsPage` now supports `employer_note` alongside status changes (API already allowed it).
- Enriched `seed_demo` from 1 company / 3 jobs to **4 companies / 12 jobs** with varied categories, types, locations + second employer/admin + richer seeker profile so the site isn't empty on first run.
- Verified end-to-end build: `pip -r requirements-dev` + `pytest 3 passed` + `npm run build` ok.

---

## 📜 License & Credits

Portfolio use. Inspired by Mero Job (Nepal). UI: Tailwind + Sonner + React Query. Backend: Django + DRF + SimpleJWT.

*Happy hiring!* — For feedback or issues at `https://github.com/anomalyco/opencode`.
