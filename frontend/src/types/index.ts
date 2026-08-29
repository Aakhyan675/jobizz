export type Role = "job_seeker" | "employer" | "admin";

export type JobType = "full_time" | "part_time" | "internship" | "remote" | "contract";

export type ExperienceLevel = "intern" | "entry" | "mid" | "senior";

export type ApplicationStatus = "applied" | "shortlisted" | "rejected" | "hired";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: Role;
  display_name: string;
  date_joined: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Company {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  website: string;
  industry: string;
  size: string;
  location: string;
  description: string;
  owner: number;
  owner_email?: string;
  created_at: string;
  updated_at: string;
}

export interface JobCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface Job {
  id: number;
  title: string;
  company: number;
  company_detail: Company;
  category: number | null;
  category_detail: JobCategory | null;
  location: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  description?: string;
  requirements?: string;
  benefits?: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  is_published: boolean;
  views_count: number;
  applications_count?: number;
  is_saved?: boolean;
  has_applied?: boolean;
  created_by?: number;
  created_at: string;
  updated_at?: string;
}

export interface JobApplication {
  id: number;
  job: number;
  job_title: string;
  company_name: string;
  seeker: number;
  seeker_detail: User;
  cover_letter: string;
  resume: string | null;
  status: ApplicationStatus;
  employer_note: string;
  created_at: string;
  updated_at: string;
}

export interface SavedJob {
  id: number;
  job: number;
  job_detail: Job;
  created_at: string;
}

export interface SeekerProfile {
  id: number;
  user: User;
  location: string;
  headline: string;
  bio: string;
  linkedin_url: string;
  portfolio_url: string;
  skills: string[];
  education: Array<Record<string, string>>;
  experience: Array<Record<string, string>>;
  resume: string | null;
  updated_at: string;
}

export interface EmployerProfile {
  id: number;
  user: User;
  company: number | null;
  company_id: number | null;
  company_name: string | null;
  job_title: string;
  updated_at: string;
}

export interface DashboardStats {
  role: Role;
  applications_count?: number;
  saved_jobs_count?: number;
  jobs_count?: number;
  published_jobs_count?: number;
  total_views?: number;
  by_status?: Record<string, number>;
}

export interface AdminStats {
  total_users: number;
  seekers: number;
  employers: number;
  admins: number;
  total_jobs: number;
  active_jobs: number;
  expired_jobs: number;
  total_applications: number;
  recent_jobs: Array<{ id: number; title: string; company__name: string; is_published: boolean; created_at: string }>;
  recent_users: Array<{ id: number; email: string; role: string; first_name: string; last_name: string; date_joined: string }>;
  by_status: Record<string, number>;
  jobs_by_category: Record<string, number>;
}

export const JOB_TYPE_LABEL: Record<JobType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  internship: "Internship",
  remote: "Remote",
  contract: "Contract",
};

export const EXPERIENCE_LABEL: Record<ExperienceLevel, string> = {
  intern: "Intern",
  entry: "Entry",
  mid: "Mid-level",
  senior: "Senior",
};

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  hired: "Hired",
};
