// src/hooks/useUserReviewAnalytics.js
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { getValidAccessToken } from "@/utils/authUtils";

/**
 * Review analytics (time series, trends, etc.)
 * @param {string} userId
 */
export const useUserReviewAnalytics = (userId, options = {}) => {
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["user-review-analytics", { userId }],
    enabled: Boolean(userId) && isLoaded && isSignedIn,
    staleTime: 60_000,
    queryFn: async ({ queryKey, signal }) => {
      const [_key, { userId: id }] = queryKey;

      const token = await getValidAccessToken();
      if (!token) throw new Error("No valid access token available");

      const { data } = await api.get(`/api/users/${id}/review-analytics`, {
        signal,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Expecting: { data: { byMonth: [...], topKeywords: [...], ... } }
      return data;
    },
    ...options,
  });
};
