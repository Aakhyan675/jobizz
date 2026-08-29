import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "../services/endpoints";

export function useJobs(params: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => jobsApi.list(params),
  });
}

export function useJob(id?: string) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => jobsApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: jobsApi.categories,
  });
}
