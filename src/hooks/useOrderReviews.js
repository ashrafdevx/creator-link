import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

/**
 * GET /api/orders/:orderId/reviews
 */
export const useOrderReviews = (orderId, options = {}) => {
  return useQuery({
    queryKey: ["order-reviews", orderId],
    enabled: Boolean(orderId) && (options.enabled ?? true),
    staleTime: options.staleTime ?? 30_000,
    queryFn: async ({ signal }) => {
      const { data } = await api.get(`/api/orders/${orderId}/reviews`, {
        signal,
      });
      // backend returns { success, data: { orderId, reviews } }
      return Array.isArray(data) ? data : data?.data?.reviews ?? [];
    },
    ...options,
  });
};

/**
 * POST /api/orders/:orderId/reviews
 * payload: { rating, review_text }
 */
export const useSubmitOrderReview = (orderId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rating, review_text }) => {
      const payload = { rating, review_text };
      const { data } = await api.post(
        `/api/orders/${orderId}/reviews`,
        payload
      );
      return data?.data ?? data;
    },
    onSuccess: async () => {
      if (orderId) {
        await queryClient.invalidateQueries({
          queryKey: ["order-reviews", orderId],
        });
      }
    },
  });
};

/**
 * GET /api/orders/:orderId/reviews/eligibility
 * Check if user can submit a review for an order
 */
export const useOrderReviewEligibility = (orderId, options = {}) => {
  return useQuery({
    queryKey: ["order-review-eligibility", orderId],
    enabled: Boolean(orderId) && (options.enabled ?? true),
    staleTime: options.staleTime ?? 30_000,
    queryFn: async ({ signal }) => {
      const { data } = await api.get(`/api/orders/${orderId}/reviews/eligibility`, {
        signal,
      });
      return data?.data ?? data;
    },
    ...options,
  });
};
