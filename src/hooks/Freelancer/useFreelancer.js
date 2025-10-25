import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

const normalizeFilters = (f = {}) => ({
  page: f.page ?? 1,
  limit: f.limit ?? 20,
  role: f.role && f.role !== "all" ? f.role : undefined,
  active_only: f.active_only || undefined,
  niche: f.niche && f.niche !== "all" ? f.niche : undefined,
  min_rate: f.min_rate || undefined,
  max_rate: f.max_rate || undefined,
  min_rating: f.min_rating > 0 ? f.min_rating : undefined,
  availability:
    f.availability && f.availability !== "all" ? f.availability : undefined,
  search: f.search?.trim() || undefined,
  sort: f.sort || "activity",
});

export const useFreelancerSearch = (filters) => {
  const paramsObj = normalizeFilters(filters);

  return useQuery({
    queryKey: ["freelancers", paramsObj],
    queryFn: async ({ queryKey, signal }) => {
      const [_key, p] = queryKey;
      const qs = new URLSearchParams();
      Object.entries(p).forEach(([k, v]) => {
        if (v !== undefined && v !== "") qs.append(k, v);
      });
      const { data } = await api.get(
        `/api/users/freelancers?${qs.toString()}`,
        { signal }
      );
      return data;
    },
    keepPreviousData: true,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};
