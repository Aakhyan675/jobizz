import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardShell } from "./components/DashboardShell";
import { HomePage } from "./pages/HomePage";
import { JobsPage } from "./pages/JobsPage";
import { JobDetailPage } from "./pages/JobDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ForEmployersPage } from "./pages/ForEmployersPage";
import { SeekerOverviewPage } from "./pages/seeker/SeekerOverviewPage";
import { SavedJobsPage } from "./pages/seeker/SavedJobsPage";
import { SeekerApplicationsPage } from "./pages/seeker/SeekerApplicationsPage";
import { SeekerProfilePage } from "./pages/seeker/SeekerProfilePage";
import { EmployerOverviewPage } from "./pages/employer/EmployerOverviewPage";
import { MyJobsPage } from "./pages/employer/MyJobsPage";
import { JobFormPage } from "./pages/employer/JobFormPage";
import { ApplicantsPage } from "./pages/employer/ApplicantsPage";
import { CompanyProfilePage } from "./pages/employer/CompanyProfilePage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const seekerItems = [
  { to: "/seeker/dashboard", label: "Overview", end: true },
  { to: "/seeker/saved-jobs", label: "Saved jobs" },
  { to: "/seeker/applications", label: "Applications" },
  { to: "/seeker/profile", label: "Profile" },
];

const employerItems = [
  { to: "/employer/dashboard", label: "Overview", end: true },
  { to: "/employer/jobs", label: "My jobs" },
  { to: "/employer/jobs/new", label: "Post job" },
  { to: "/employer/company", label: "Company" },
];

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/employers" element={<ForEmployersPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Seeker ecosystem — supports both /seeker and /seeker/dashboard */}
        <Route
          path="/seeker"
          element={
            <ProtectedRoute allowedRoles={["job_seeker"]}>
              <DashboardShell items={seekerItems} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SeekerOverviewPage />} />
          <Route path="saved" element={<SavedJobsPage />} />
          <Route path="saved-jobs" element={<SavedJobsPage />} />
          <Route path="applications" element={<SeekerApplicationsPage />} />
          <Route path="profile" element={<SeekerProfilePage />} />
        </Route>

        {/* Employer ecosystem */}
        <Route
          path="/employer"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <DashboardShell items={employerItems} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployerOverviewPage />} />
          <Route path="jobs" element={<MyJobsPage />} />
          <Route path="jobs/new" element={<JobFormPage />} />
          <Route path="jobs/:id/edit" element={<JobFormPage />} />
          <Route path="jobs/:id/applicants" element={<ApplicantsPage />} />
          <Route path="company" element={<CompanyProfilePage />} />
        </Route>

        {/* Admin ecosystem — frontend admin dashboard (distinct from Django /admin/) */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        {/* Alias: /admin → /admin/dashboard for convenience */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Legacy /dashboard redirect — role-aware via component */}
        <Route path="/dashboard" element={<Navigate to="/seeker/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
