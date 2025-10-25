// src/hooks/useUserReviews.js
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { getValidAccessToken } from "@/utils/authUtils";

/**
 * Reviews list (paginated)
 * @param {string} freelancerId
 * @param {object} params  { page, limit, isPublic, rating, dateFrom, dateTo, sort }
 * @param {object} options react-query options override
 */
export const useUserReviews = (
  freelancerId,
  {
    page = 1,
    limit = 10,
    isPublic = true,
    rating, // optional exact rating filter (e.g. 5)
    dateFrom, // "YYYY-MM-DD"
    dateTo, // "YYYY-MM-DD"
    sort = "newest",
  } = {},
  options = {}
) => {
  return useQuery({
    queryKey: [
      "user-reviews",
      {
        freelancerId: String(freelancerId || ""),
        page,
        limit,
        isPublic,
        rating,
        dateFrom,
        dateTo,
        sort,
      },
    ],
    // Only run when we have an ID AND auth is ready/signed in
    enabled: Boolean(freelancerId),
    keepPreviousData: true,
    staleTime: 60_000,
    retry: 1, // make debugging easier
    queryFn: async ({ queryKey, signal }) => {
      const [_key, q] = queryKey;

      const resp = await api.get(`/api/users/${q.freelancerId}/reviews`, {
        signal,
        params: {
          page: q.page,
          limit: q.limit,
          // If your backend expects snake_case, keep this:
          is_public: q.isPublic,
          // Only send rating if defined to avoid overriding server defaults
          ...(q.rating !== undefined ? { rating: q.rating } : {}),
          ...(q.dateFrom ? { dateFrom: q.dateFrom } : {}),
          ...(q.dateTo ? { dateTo: q.dateTo } : {}),
          ...(q.sort ? { sort: q.sort } : {}),
        },
      });

      // Expected: { data: { items, total, page, limit } } or similar
      return resp.data;
    },
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error("useUserReviews error:", err);
    },
    ...options,
  });
};
