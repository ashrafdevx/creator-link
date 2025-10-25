// src/hooks/useUserRating.js
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { getValidAccessToken } from "@/utils/authUtils";

export const useUserRating = (userId, options = {}) => {
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["user-rating", { userId }],
    enabled: Boolean(userId) && isLoaded && isSignedIn,
    staleTime: 60_000,
    queryFn: async ({ queryKey, signal }) => {
      const [_key, { userId: id }] = queryKey;

      const token = await getValidAccessToken();
      if (!token) throw new Error("No valid access token available");

      const { data } = await api.get(`/api/users/${id}/rating`, {
        signal,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Expecting something like: { data: { average: 4.9, count: 128, buckets: {5:100,4:20,...} } }
      return data;
    },
    ...options,
  });
};
