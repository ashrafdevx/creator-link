import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "./useAuth";
import { getValidAccessToken } from "@/utils/authUtils";

// ---- Mocks (unchanged) ----
const mockBalance = {
  available: 333.33,
  pending: 1200.0,
  total_earned: 15420.5,
};

const mockTransactions = [
  {
    id: "txn_1",
    date: "2024-01-15T10:30:00Z",
    order: { id: "order_1", title: "YouTube Thumbnail Design Package" },
    from_user: { name: "John Smith", role: "client" },
    to_user: { name: "Alex Rodriguez", role: "freelancer" },
    amount: 100.0,
    platform_fee: 10.0,
    net_amount: 97.0,
    status: "completed",
    type: "escrow_release",
    stripe_charge_id: "ch_test_123",
  },
  {
    id: "txn_2",
    date: "2024-01-10T14:22:00Z",
    order: { id: "order_2", title: "TikTok Video Editing" },
    from_user: { name: "Sarah Johnson", role: "client" },
    to_user: { name: "Alex Rodriguez", role: "freelancer" },
    amount: 250.0,
    platform_fee: 25.0,
    net_amount: 242.5,
    status: "completed",
    type: "escrow_release",
    stripe_charge_id: "ch_test_456",
  },
  {
    id: "txn_3",
    date: "2024-01-08T09:15:00Z",
    order: { id: "order_3", title: "Instagram Content Creation" },
    from_user: { name: "Mike Chen", role: "client" },
    to_user: { name: "Alex Rodriguez", role: "freelancer" },
    amount: 150.0,
    platform_fee: 15.0,
    net_amount: 145.5,
    status: "pending",
    type: "escrow_hold",
    stripe_charge_id: "ch_test_789",
  },
];

const mockAnalytics = {
  daily: [
    { date: "2024-01-01", earnings: 0, expenses: 0 },
    { date: "2024-01-02", earnings: 100, expenses: 110 },
    { date: "2024-01-03", earnings: 250, expenses: 275 },
    { date: "2024-01-04", earnings: 0, expenses: 0 },
    { date: "2024-01-05", earnings: 150, expenses: 165 },
  ],
  weekly: [
    { week: "Week 1", earnings: 500, expenses: 550 },
    { week: "Week 2", earnings: 750, expenses: 825 },
    { week: "Week 3", earnings: 600, expenses: 660 },
    { week: "Week 4", earnings: 900, expenses: 990 },
  ],
  monthly: [
    { month: "Oct", earnings: 2200, expenses: 2420 },
    { month: "Nov", earnings: 2800, expenses: 3080 },
    { month: "Dec", earnings: 3100, expenses: 3410 },
    { month: "Jan", earnings: 2750, expenses: 3025 },
  ],
};

const mockPaymentMethods = [
  {
    id: "pm_1",
    type: "card",
    is_default: true,
    is_active: true,
    card_details: {
      last4: "4242",
      brand: "visa",
      exp_month: 12,
      exp_year: 2025,
      country: "US",
      funding: "credit",
    },
    metadata: {
      nickname: "Personal Visa",
      last_used_at: "2024-01-15T10:30:00Z",
    },
  },
  {
    id: "pm_2",
    type: "bank",
    is_default: false,
    is_active: true,
    bank_details: {
      last4: "6789",
      bank_name: "Chase Bank",
      account_type: "checking",
      routing_number: "011401533",
    },
    metadata: {
      nickname: "Business Checking",
      last_used_at: "2024-01-10T14:22:00Z",
    },
  },
];

// ---------------------- QUERIES ----------------------

// Hook for getting user balance (freelancers only) ---> Done
export const useBalance = () => {
  const { isLoaded, isSignedIn, user } = useAuth();
  const role = user?.role ?? user?.user?.role ?? null;
  const isFreelancer = role === "freelancer";

  return useQuery({
    queryKey: ["balance"],
    enabled: isLoaded && isSignedIn && isFreelancer, // wait for token and role
    queryFn: async ({ signal }) => {
      const { data } = await api.get("/api/payment-settings/balance", {
        signal,
      });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });
};

// Hook for getting transaction history ---> Done
export const useTransactions = (filters = {}) => {
  const { isLoaded, isSignedIn, user } = useAuth();
  const role = user?.role ?? user?.user?.role ?? null;
  const isFreelancer = role === "freelancer";
  const queryKey = ["transactions", filters];

  return useQuery({
    queryKey,
    enabled: isLoaded && isSignedIn && isFreelancer,
    queryFn: async ({ signal }) => {
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value);
          }
        });

        const { data } = await api.get(
          `/api/payment-settings/transactions?${params.toString()}`,
          { signal }
        );
        return data.data;
      } catch (error) {
        console.log("Using mock transaction data");
        return {
          transactions: mockTransactions,
          pagination: {
            page: 1,
            limit: 10,
            total: mockTransactions.length,
            pages: 1,
          },
        };
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });
};

// Hook for getting earnings/spending analytics  --> Done
export const useAnalytics = (dateRange = {}) => {
  const { isLoaded, isSignedIn, user } = useAuth();
  const role = user?.role ?? user?.user?.role ?? null;
  const isFreelancer = role === "freelancer";

  return useQuery({
    queryKey: ["analytics", dateRange],
    enabled: isLoaded && isSignedIn && isFreelancer,
    queryFn: async ({ signal }) => {
      try {
        const params = new URLSearchParams();
        if (dateRange.date_from)
          params.append("date_from", dateRange.date_from);
        if (dateRange.date_to) params.append("date_to", dateRange.date_to);
        if (dateRange.granularity)
          params.append("granularity", dateRange.granularity);

        const { data } = await api.get(
          `/api/payment-settings/analytics?${params.toString()}`,
          { signal }
        );
        return data.data;
      } catch (error) {
        console.log("Using mock analytics data");
        return mockAnalytics;
      }
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });
};

// Hook for getting payment methods
export const usePaymentMethods = () => {
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["paymentMethods"],
    enabled: isLoaded && isSignedIn,
    queryFn: async ({ signal }) => {
      try {
        const { data } = await api.get("/api/payment-settings/methods", {
          signal,
        });
        return data.data;
      } catch (error) {
        console.log("Using mock payment methods data");
        return mockPaymentMethods;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });
};

// Hook for getting payout settings (freelancers only)
export const usePayoutSettings = () => {
  const { isLoaded, isSignedIn, user } = useAuth();
  const role = user?.role ?? user?.user?.role ?? null;
  const isFreelancer = role === "freelancer";

  return useQuery({
    queryKey: ["payoutSettings"],
    enabled: isLoaded && isSignedIn && isFreelancer,
    queryFn: async ({ signal }) => {
      try {
        const { data } = await api.get("/api/payment-settings/payout", {
          signal,
        });
        return data.data;
      } catch (error) {
        console.log("Using mock payout settings data");
        return {
          stripe_connect_account_id: "acct_test_123",
          is_connected: true,
          payout_schedule: "manual",
          payout_threshold: 10.0,
          next_payout_date: null,
        };
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });
};

// ---------------------- MUTATIONS ----------------------

// Withdrawal --> Done
export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (withdrawalData) => {
      const { data } = await api.post(
        "/api/payment-settings/withdraw",
        withdrawalData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useAddPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      if (
        !payload ||
        typeof payload.payment_method_id !== "string" ||
        !payload.payment_method_id.trim()
      ) {
        throw new Error("payment_method_id is required");
      }

      const headers = {};
      try {
        const token = await getValidAccessToken?.();
        if (token) headers.Authorization = `Bearer ${token}`;
      } catch (_) {}

      const body = {
        payment_method_id: payload.payment_method_id,
        set_as_default: Boolean(payload.set_as_default),
        nickname: payload.nickname ?? undefined,
      };

      // Adjust endpoint if your backend path differs
      const { data } = await api.post("/api/payouts/payment-methods", body, {
        headers,
      });

      // Expecting: { success: true, data: { ...createdPaymentMethod } }
      return data;
    },
    onSuccess: () => {
      // Refresh saved methods UI
      queryClient.invalidateQueries({ queryKey: ["payout-settings"] });
    },
  });
};
// export const useAddPaymentMethod = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (paymentMethodData) => {
//       const { data } = await api.post(
//         "/api/payment-settings/methods",
//         paymentMethodData
//       );
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
//     },
//   });
// };

export const useRemovePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethodId) => {
      const { data } = await api.delete(
        `/api/payment-settings/methods/${paymentMethodId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
};

export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethodId) => {
      const { data } = await api.put(
        `/api/payment-settings/methods/${paymentMethodId}/default`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
};

// ---------------------- Stripe Connect ----------------------

export const useCreateConnectAccountLink = () => {
  return useMutation({
    mutationFn: async ({ refresh_url, return_url }) => {
      const headers = {};
      try {
        const token = await getValidAccessToken?.();
        if (token) headers.Authorization = `Bearer ${token}`;
      } catch {}

      const { data } = await api.post(
        "/api/payment-settings/connect-account-link",
        { refresh_url, return_url },
        { headers }
      );

      // Your API shape:
      // { success: true, data: { account_link_url: "...", expires_at: 1758215399 } }
      const url = data?.data?.account_link_url ?? data?.data?.url ?? data?.url;

      if (!url) throw new Error("Connect account link URL not returned by API");

      const expiresAt = data?.data?.expires_at ?? null; // unix seconds
      return { url, expiresAt };
    },
  });
};

export const useCreateConnectDashboardLink = () => {
  return useMutation({
    mutationFn: async ({ return_url } = {}) => {
      const headers = {};
      try {
        const token = await getValidAccessToken?.();
        if (token) headers.Authorization = `Bearer ${token}`;
      } catch {}

      const { data } = await api.post(
        "/api/payment-settings/connect-dashboard-link",
        return_url ? { return_url } : {},
        { headers }
      );

      return (
        data?.data ?? {
          dashboard_url: data?.dashboard_url ?? data?.url,
          expires_at: data?.expires_at,
        }
      );
    },
  });
};
