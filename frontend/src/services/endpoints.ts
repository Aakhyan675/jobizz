import { api } from "./api";
import type {
  AuthResponse,
  Company,
  DashboardStats,
  EmployerProfile,
  Job,
  JobApplication,
  JobCategory,
  Paginated,
  SavedJob,
  SeekerProfile,
  User,
} from "../types";

export const authApi = {
  register: (payload: Record<string, string>) => api.post<AuthResponse>("/auth/register/", payload).then((r) => r.data),
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login/", { email, password }).then((r) => r.data),
  logout: (refresh: string) => api.post("/auth/logout/", { refresh }),
  me: () => api.get<User>("/me/").then((r) => r.data),
  updateMe: (payload: Partial<User>) => api.patch<User>("/me/", payload).then((r) => r.data),
  passwordReset: (email: string) => api.post("/auth/password-reset/", { email }).then((r) => r.data),
  passwordResetConfirm: (payload: { uid: string; token: string; new_password: string }) =>
    api.post("/auth/password-reset/confirm/", payload).then((r) => r.data),
  dashboard: () => api.get<DashboardStats>("/dashboard/").then((r) => r.data),
};

export const adminApi = {
  stats: () => api.get<import("../types").AdminStats>("/admin/stats/").then((r) => r.data),
};

export const jobsApi = {
  list: (params: Record<string, string | number | undefined>) =>
    api.get<Paginated<Job>>("/jobs/", { params }).then((r) => r.data),
  featured: () => api.get<Paginated<Job>>("/jobs/", { params: { page_size: 6, ordering: "-created_at" } }).then((r) => r.data),
  get: (id: string | number) => api.get<Job>(`/jobs/${id}/`).then((r) => r.data),
  create: (payload: Record<string, unknown>) => api.post<Job>("/jobs/", payload).then((r) => r.data),
  update: (id: number, payload: Record<string, unknown>) => api.patch<Job>(`/jobs/${id}/`, payload).then((r) => r.data),
  remove: (id: number) => api.delete(`/jobs/${id}/`),
  publish: (id: number) => api.post<Job>(`/jobs/${id}/publish/`).then((r) => r.data),
  unpublish: (id: number) => api.post<Job>(`/jobs/${id}/unpublish/`).then((r) => r.data),
  mine: () => api.get<Paginated<Job>>("/jobs/", { params: { mine: true, page_size: 50 } }).then((r) => r.data),
  categories: () => api.get<JobCategory[]>("/categories/").then((r) => r.data),
};

export const applicationsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<Paginated<JobApplication>>("/applications/", { params }).then((r) => r.data),
  apply: (job: number, cover_letter: string) =>
    api.post<JobApplication>("/applications/", { job, cover_letter }).then((r) => r.data),
  update: (id: number, payload: { status?: string; employer_note?: string }) =>
    api.patch<JobApplication>(`/applications/${id}/`, payload).then((r) => r.data),
};

export const savedJobsApi = {
  list: () => api.get<Paginated<SavedJob>>("/saved-jobs/", { params: { page_size: 50 } }).then((r) => r.data),
  save: (job: number) => api.post<SavedJob>("/saved-jobs/", { job }).then((r) => r.data),
  remove: (id: number) => api.delete(`/saved-jobs/${id}/`),
};

export const profilesApi = {
  seeker: () => api.get<SeekerProfile>("/seeker-profile/").then((r) => r.data),
  updateSeeker: (payload: FormData | Record<string, unknown>) =>
    api.patch<SeekerProfile>("/seeker-profile/", payload).then((r) => r.data),
  employer: () => api.get<EmployerProfile>("/employer-profile/").then((r) => r.data),
  updateEmployer: (payload: Record<string, unknown>) =>
    api.patch<EmployerProfile>("/employer-profile/", payload).then((r) => r.data),
};

export const companiesApi = {
  list: () => api.get<Paginated<Company>>("/companies/").then((r) => r.data),
  get: (id: number) => api.get<Company>(`/companies/${id}/`).then((r) => r.data),
  create: (payload: FormData | Record<string, unknown>) => api.post<Company>("/companies/", payload).then((r) => r.data),
  update: (id: number, payload: FormData | Record<string, unknown>) =>
    api.patch<Company>(`/companies/${id}/`, payload).then((r) => r.data),
};
