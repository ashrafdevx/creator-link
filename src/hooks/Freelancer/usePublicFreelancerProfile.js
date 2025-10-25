import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const fetchPublicFreelancer = async (freelancerId) => {
  if (!freelancerId) throw new Error("freelancerId is required");
  const { data } = await api.get(
    `/api/users/freelancers/public/${freelancerId}`
  );
  // If your API wraps payloads as { success, data }, return data.data:
  // return data?.data ?? data;
  return data?.data;
};

export const usePublicFreelancer = (freelancerId, options = {}) => {
  return useQuery({
    queryKey: ["public-freelancer", freelancerId],
    queryFn: () => fetchPublicFreelancer(freelancerId),
    enabled: Boolean(freelancerId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });
};
