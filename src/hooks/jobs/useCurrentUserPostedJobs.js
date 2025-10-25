// useMyJobs.js
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getValidAccessToken } from "@/utils/authUtils";
import api from "@/lib/axios";
import { toast } from "sonner";

export const useMyJobs = (page = 1, limit = 10, options = {}) => {
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["my-jobs", { page, limit }],
    enabled: isLoaded && isSignedIn, // don't fire until auth is ready and signed in
    queryFn: async ({ queryKey, signal }) => {
      const [_key, p] = queryKey;
      const token = await getValidAccessToken();
      if (!token) throw new Error("No valid access token available");

      const { data } = await api.get("/api/jobs/my-jobs", {
        params: { page: p.page, limit: p.limit },
        signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    },
    keepPreviousData: true,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    onSuccess: () => {
      toast.success("My jobs loaded");
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load your jobs";
      toast.error(msg);
    },
    ...options, // allow caller to override handlers if needed
  });
};

// // useMyJobs.js
// import { useQuery } from "@tanstack/react-query";
// import { useAuth } from "@/hooks/useAuth";
// import { getValidAccessToken } from "@/utils/authUtils";
// import api from "@/lib/axios";

// export const useMyJobs = (page = 1, limit = 10, options = {}) => {
//   const { isLoaded, isSignedIn } = useAuth();

//   return useQuery({
//     queryKey: ["my-jobs", { page, limit }],
//     enabled: isLoaded && isSignedIn, // don't fire until auth is ready and signed in
//     queryFn: async ({ queryKey, signal }) => {
//       const [_key, p] = queryKey;
//       const token = await getValidAccessToken();
//       if (!token) throw new Error("No valid access token available");

//       const { data } = await api.get("/api/jobs/my-jobs", {
//         params: { page: p.page, limit: p.limit },
//         signal,
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       return data;
//     },
//     keepPreviousData: true,
//     staleTime: 60_000,
//     refetchOnWindowFocus: false,
//     ...options,
//   });
// };
