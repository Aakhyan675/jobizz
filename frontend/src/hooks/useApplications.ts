import { useQuery } from "@tanstack/react-query";
import { applicationsApi, authApi, savedJobsApi } from "../services/endpoints";
import { useAuth } from "../context/AuthContext";

export function useDashboardStats() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: authApi.dashboard,
    enabled: isAuthenticated,
  });
}

export function useApplications(params?: Record<string, string | number>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["applications", params],
    queryFn: () => applicationsApi.list(params),
    enabled: isAuthenticated,
  });
}

export function useSavedJobs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["saved-jobs"],
    queryFn: savedJobsApi.list,
    enabled: user?.role === "job_seeker",
  });
}
