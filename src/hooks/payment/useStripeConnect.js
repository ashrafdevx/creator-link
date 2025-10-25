// hooks/payments/useStripeConnect.js
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { getValidAccessToken } from "@/utils/authUtils";

/**
 * Create a Stripe Connect onboarding link and redirect the user to it.
 * Backend should return: { success: true, url: "https://connect.stripe.com/..." }
 */
export const useCreateConnectOnboardingLink = () => {
  return useMutation({
    mutationFn: async () => {
      const token = await getValidAccessToken();
      const { data } = await api.post(
        "/api/payments/stripe/connect/onboarding-link",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data?.success || !data?.url) {
        throw new Error("Could not get Stripe onboarding link");
      }
      return data.url;
    },
  });
};

/**
 * Optional: Get a Stripe dashboard link (for already-onboarded users)
 * Backend should return: { success: true, url: "https://dashboard.stripe.com/..."}
 */
export const useCreateStripeDashboardLink = () => {
  return useMutation({
    mutationFn: async () => {
      const token = await getValidAccessToken();
      const { data } = await api.post(
        "/api/payments/stripe/connect/dashboard-link",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data?.success || !data?.url) {
        throw new Error("Could not get Stripe dashboard link");
      }
      return data.url;
    },
  });
};
