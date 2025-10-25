import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const fetchPublicUser = async (userId) => {
  if (!userId) throw new Error("userId is required");
  const { data } = await api.get(`/api/users/public/${userId}`);
  return data?.data;
};
// hooks/usePublicUser.js

export const usePublicUser = (userId, options = {}) => {
  return useQuery({
    queryKey: ["public-user", userId],
    queryFn: () => fetchPublicUser(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000, // 5 min cache
    retry: 1,
    ...options,
  });
};
