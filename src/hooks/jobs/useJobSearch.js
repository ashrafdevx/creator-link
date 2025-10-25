import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { getValidAccessToken } from "@/utils/authUtils";
import { toast } from "sonner";

const normalize = (t) => (t ?? "").trim();

const fetchJobs = async ({ queryKey, signal }) => {
  const [_key, q] = queryKey;
  const term = normalize(q?.search) || "designer"; // ← updated
  const params = { search: term }; // ← always send a search
  const { data } = await api.get("/api/jobs/active", { params, signal });
  return data;
};

// import { useMutation } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
// import { useAuth } from "@/hooks/useAuth";
// import { api } from "@/lib/api";

export const useRecommendJob = (initialParams = {}) => {
  const { isSignedIn, user, isLoading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useState(initialParams);
  const [lastSearchData, setLastSearchData] = useState(null);

  const mutation = useMutation({
    mutationFn: async (incomingParams = {}) => {
      const params = {
        page: 1,
        limit: 20,
        ...initialParams,
        ...incomingParams,
      };

      const queryParams = new URLSearchParams();

      if (params.page) queryParams.set("page", String(params.page));
      if (params.limit) queryParams.set("limit", String(params.limit));

      if (params?.search && params.search.trim()) {
        queryParams.append("search", params.search.trim());
      }
      if (params?.role_needed && params.role_needed !== "all") {
        queryParams.append("role_needed", params.role_needed);
      }
      if (params?.niches && params.niches !== "all") {
        queryParams.append("niches", params.niches);
      }
      if (params?.minBudget !== undefined && params.minBudget !== "") {
        queryParams.append("minBudget", String(params.minBudget));
      }
      if (params?.maxBudget !== undefined && params.maxBudget !== "") {
        queryParams.append("maxBudget", String(params.maxBudget));
      }
      if (params?.sort && params.sort !== "newest") {
        queryParams.append("sort", params.sort);
      }

      // Get user ID from multiple possible locations
      const freelancerId =
        params.freelancer_id ||
        user?.id ||
        user?._id ||
        user?.userId ||
        user?.user?.id ||
        user?.user?._id;

      // Check multiple auth indicators
      const isAuthenticated = Boolean(
        isSignedIn ||
          user?.id ||
          user?._id ||
          user?.userId ||
          user?.user?.id ||
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          document.cookie.includes("auth") // adjust based on your auth method
      );

      const shouldUseRecommendations = Boolean(isAuthenticated && freelancerId);

      let url;
      if (shouldUseRecommendations) {
        const minScore = params.minScore ?? 30;
        queryParams.set("minScore", String(minScore));
        url = `/api/jobs/recommendations/${freelancerId}?${queryParams.toString()}`;
      }
      // else {
      // url = `/api/jobs/active?${queryParams.toString()}`;
      // }

      const { data } = await api.get(url);
      return data;
    },
    onError: (error) => {
      console.error("Job search error:", error);
      const msg =
        error?.response?.data?.message || error?.message || "Job search failed";
      toast.error(msg);
    },
    onSuccess: (data) => {
      setLastSearchData(data);
    },
  });

  // Auto-search but wait for auth to be resolved
  useEffect(() => {
    if (!authLoading) {
      // Only run when auth is no longer loading
      console.log("Running auto-search, auth resolved:", { isSignedIn, user });
      mutation.mutate(initialParams);
    }
  }, [isSignedIn, user?.id, user?._id, user?.userId, authLoading]);

  const refetch = useCallback(() => {
    return mutation.mutate(searchParams);
  }, [searchParams, mutation.mutate]);

  const searchJobs = useCallback(
    (newParams = {}) => {
      const mergedParams = { ...initialParams, ...newParams };
      setSearchParams(mergedParams);
      return mutation.mutate(mergedParams);
    },
    [initialParams, mutation.mutate]
  );

  return {
    mutate: searchJobs,
    data: lastSearchData || mutation.data,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isLoading: mutation.isLoading || mutation.isPending || authLoading,
    isFetching: mutation.isPending,
    refetch,
  };
};
export const useJobSearch = (initialParams = {}) => {
  return useMutation({
    mutationFn: async (searchParams) => {
      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add search term if provided
      if (searchParams?.search && searchParams.search.trim()) {
        queryParams.append("search", searchParams.search.trim());
      }

      // Add filters if they're not default values
      if (searchParams?.role_needed && searchParams.role_needed !== "all") {
        queryParams.append("role_needed", searchParams.role_needed);
      }

      if (searchParams?.niches && searchParams.niches !== "all") {
        queryParams.append("niches", searchParams.niches);
      }

      if (searchParams?.minBudget && searchParams.minBudget !== "") {
        queryParams.append("minBudget", searchParams.minBudget);
      }

      if (searchParams?.maxBudget && searchParams.maxBudget !== "") {
        queryParams.append("maxBudget", searchParams.maxBudget);
      }

      if (searchParams?.sort && searchParams.sort !== "newest") {
        queryParams.append("sort", searchParams.sort);
      }

      // Construct the URL
      const url = `/api/jobs/active?${queryParams.toString()}`;

      const { data } = await api.get(url);
      return data;
    },
    onError: (error) => {
      console.error("Job search error:", error);
    },
    onSuccess: (data) => {},
  });
};

// Hook for getting a single job by ID
export const useJob = (jobId, options = {}) => {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: async ({ queryKey, signal }) => {
      const [_key, id] = queryKey;

      if (!id) {
        throw new Error("Job ID is required");
      }

      console.log("Fetching job with ID:", id);

      const { data } = await api.get(`/api/jobs/${id}`, { signal });
      console.log("Single job response:", data);
      return data;
    },
    enabled: !!jobId, // Only run query if jobId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load job";
      toast.error(msg);
    },
    ...options,
  });
};

// Alternative implementation using useQuery if you prefer that approach:
export const useJobSearchQuery = (searchParams, options = {}) => {
  return useQuery({
    queryKey: ["job-search", searchParams],
    queryFn: async ({ queryKey, signal }) => {
      const [_key, params] = queryKey;

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params?.search && params.search.trim()) {
        queryParams.append("search", params.search.trim());
      }

      if (params?.role_needed && params.role_needed !== "all") {
        queryParams.append("role_needed", params.role_needed);
      }

      if (params?.niches && params.niches !== "all") {
        queryParams.append("niches", params.niches);
      }

      if (params?.minBudget && params.minBudget !== "") {
        queryParams.append("minBudget", params.minBudget);
      }

      if (params?.maxBudget && params.maxBudget !== "") {
        queryParams.append("maxBudget", params.maxBudget);
      }

      if (params?.sort && params.sort !== "newest") {
        queryParams.append("sort", params.sort);
      }

      const url = queryParams.toString()
        ? `/api/jobs/active?${queryParams.toString()}`
        : "/api/jobs/active";

      const { data } = await api.get(url, { signal });
      return data;
    },
    enabled: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load jobs";
      toast.error(msg);
    },
    ...options,
  });
};

// --- Single job by ID (with custom JWT token) ------------------------------------

const fetchJobById = async ({ queryKey, signal }) => {
  const [_key, id] = queryKey;
  if (!id) throw new Error("jobId is required");

  const token = await getValidAccessToken();
  if (!token) throw new Error("No valid access token available");

  const { data } = await api.get(`/api/jobs/${id}`, {
    signal,
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const useJobById = (id, options = {}) => {
  const { isSignedIn, isLoaded } = useAuth();

  return useQuery({
    queryKey: ["job", id],
    queryFn: fetchJobById,
    enabled: !!id && isLoaded && isSignedIn,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load job";
      toast.error(msg);
    },
    ...options,
  });
};

// useJobApplications.js

export const useJobApplications = (
  jobId,
  page = 1,
  limit = 10,
  options = {}
) => {
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["job-applications", { jobId, page, limit }],
    enabled: Boolean(jobId) && isLoaded && isSignedIn, // wait for auth & require id
    queryFn: async ({ queryKey, signal }) => {
      const [_key, p] = queryKey;
      if (!p.jobId) throw new Error("jobId is required");

      const token = await getValidAccessToken();
      if (!token) throw new Error("No valid access token available");

      const { data } = await api.get(`/api/jobs/${p.jobId}/applications`, {
        params: { page: p.page, limit: p.limit }, // -> ?page=1&limit=10
        signal,
        headers: {
          Authorization: `Bearer ${token}`, // change to JWT/Token if your API expects it
        },
      });

      return data;
    },
    keepPreviousData: true,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    onSuccess: () => {
      toast.success("Applications loaded");
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load applications";
      toast.error(msg);
    },
    ...options,
  });
};

// Job Status Completed Endpoint
const jobComletoinMutation = async ({ jobId, applicationId }) => {
  if (!jobId || !applicationId) {
    throw new Error("jobId and applicationId are required");
  }
  const token = await getValidAccessToken();
  if (!token) throw new Error("No valid access token available");

  const { data } = await api.post(
    `/api/jobs/${jobId}/complete`, // Call the complete job API
    { freelancerId: applicationId },
    {
      headers: {
        Authorization: `Bearer ${token}`, // change to JWT/Token if your API expects it
      },
    } // Send freelancerId in the payload
  );

  return data;
};

export const useJobCompletion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: jobComletoinMutation, // Using mutationFn as per the new syntax
    onSuccess: (jobId) => {
      toast.success("Job marked as completed");
      queryClient.invalidateQueries({ queryKey: ["job-applications", jobId] });
    },
    onError: (error) => {
      console.log("Error completing job:", error.message);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to complete job";
      toast.error(msg);
    },
  });
};

// Mutation function for canceling the job (Reject)
const cancelJobFn = async ({ jobId, reason }) => {
  if (!jobId || !reason) {
    throw new Error("jobId and reason are required");
  }

  const token = await getValidAccessToken();
  if (!token) throw new Error("No valid access token available");

  const { data } = await api.post(
    `/api/jobs/${jobId}/cancel`, // API call to cancel the job
    { reason }, // Send the reason in the body
    {
      headers: {
        Authorization: `Bearer ${token}`, // Token in Authorization header
      },
    }
  );

  return data;
};

export const useJobReject = () => {
  // Use the mutation for canceling the job
  return useMutation({
    mutationFn: cancelJobFn,
    onSuccess: (data) => {
      toast.success("Job cancelled");
      console.log("Job rejected successfully:", data);
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to cancel job";
      toast.error(msg);
      console.log("Error rejecting job:", error.message);
    },
  });
};

// Mutation function for selecting a freelancer
// shortlisted freelancer

// inside your component
export const ShortlistMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, applicationId }) => {
      const { data } = await api.put(
        `/api/jobs/${jobId}/applications/${applicationId}`,
        {
          status: "shortlisted",
          notes:
            "Great portfolio! Love the design style and tech focus. Moving to shortlist for further consideration.",
        }
      );
      return data;
    },
    onSuccess: (jobId) => {
      toast.success("Applicant shortlisted");
      queryClient.invalidateQueries({ queryKey: ["job-applications", jobId] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to shortlist applicant"
      );
    },
  });
};

// Freelancer Apply for job

// Option 1: Modify the hook to accept both jobId and body
export const useApplyJob = (jobId) =>
  useMutation({
    mutationFn: async (body) => {
      console.log("jobId", jobId, "body", body);
      const { data } = await api.post(`/api/jobs/${jobId}/apply`, body);
      return data;
    },
    onError: (error) => {
      const errorData = error?.response?.data;

      // Check if there are specific validation errors
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorData.errors.forEach(err => toast.error(err));
      } else {
        toast.error(
          errorData?.message || error?.message || "Apply failed"
        );
      }
    },
  });

// Update Job Status

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, status = "draft" }) => {
      const { data } = await api.put(`/api/jobs/${jobId}/status`, { status });
      return data;
    },
    onSuccess: (_data, vars) => {
      // refresh lists & the single job if present
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
      if (vars?.jobId) {
        queryClient.invalidateQueries({ queryKey: ["job", vars.jobId] });
      }
    },
  });
};

// Update job mutation
export const useUpdateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/api/jobs/${id}`, payload);
      return data;
    },
    onSuccess: (_res, vars) => {
      if (vars?.id) {
        qc.invalidateQueries({ queryKey: ["job", vars.id] });
      }
      qc.invalidateQueries({ queryKey: ["my-jobs"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import api from "@/lib/axios";
// import { useAuth } from "@/hooks/useAuth";
// import { getValidAccessToken } from "@/utils/authUtils";

// const normalize = (t) => (t ?? "").trim();

// const fetchJobs = async ({ queryKey, signal }) => {
//   const [_key, q] = queryKey;
//   const term = normalize(q?.search) || "designer"; // ← updated
//   const params = { search: term }; // ← always send a search
//   const { data } = await api.get("/api/jobs/active", { params, signal });
//   return data;
// };

// // useJobSearch: coalesce empty to "designer"
// // useJobSearch.js
// // import { useMutation } from "@tanstack/react-query";
// import { useState, useCallback, useEffect } from "react";
// // import { useAuth } from "@/hooks/useAuth";
// // import { api } from "@/lib/api";

// export const useJobSearch = (initialParams = {}) => {
//   const { isSignedIn, user, isLoading: authLoading } = useAuth();
//   const [searchParams, setSearchParams] = useState(initialParams);
//   const [lastSearchData, setLastSearchData] = useState(null);

//   const mutation = useMutation({
//     mutationFn: async (incomingParams = {}) => {
//       const params = {
//         page: 1,
//         limit: 20,
//         ...initialParams,
//         ...incomingParams,
//       };

//       const queryParams = new URLSearchParams();

//       if (params.page) queryParams.set("page", String(params.page));
//       if (params.limit) queryParams.set("limit", String(params.limit));

//       if (params?.search && params.search.trim()) {
//         queryParams.append("search", params.search.trim());
//       }
//       if (params?.role_needed && params.role_needed !== "all") {
//         queryParams.append("role_needed", params.role_needed);
//       }
//       if (params?.niches && params.niches !== "all") {
//         queryParams.append("niches", params.niches);
//       }
//       if (params?.minBudget !== undefined && params.minBudget !== "") {
//         queryParams.append("minBudget", String(params.minBudget));
//       }
//       if (params?.maxBudget !== undefined && params.maxBudget !== "") {
//         queryParams.append("maxBudget", String(params.maxBudget));
//       }
//       if (params?.sort && params.sort !== "newest") {
//         queryParams.append("sort", params.sort);
//       }

//       // Get user ID from multiple possible locations
//       const freelancerId =
//         params.freelancer_id ||
//         user?.id ||
//         user?._id ||
//         user?.userId ||
//         user?.user?.id ||
//         user?.user?._id;

//       // Check multiple auth indicators
//       const isAuthenticated = Boolean(
//         isSignedIn ||
//           user?.id ||
//           user?._id ||
//           user?.userId ||
//           user?.user?.id ||
//           localStorage.getItem("token") ||
//           localStorage.getItem("authToken") ||
//           document.cookie.includes("auth") // adjust based on your auth method
//       );

//       const shouldUseRecommendations = Boolean(isAuthenticated && freelancerId);

//       let url;
//       if (shouldUseRecommendations) {
//         const minScore = params.minScore ?? 30;
//         queryParams.set("minScore", String(minScore));
//         url = `/api/jobs/recommendations/${freelancerId}?${queryParams.toString()}`;
//       } else {
//         url = `/api/jobs/active?${queryParams.toString()}`;
//       }

//       const { data } = await api.get(url);
//       return data;
//     },
//     onError: (error) => {
//       console.error("Job search error:", error);
//     },
//     onSuccess: (data) => {
//       setLastSearchData(data);
//     },
//   });

//   // Auto-search but wait for auth to be resolved
//   useEffect(() => {
//     if (!authLoading) {
//       // Only run when auth is no longer loading
//       console.log("Running auto-search, auth resolved:", { isSignedIn, user });
//       mutation.mutate(initialParams);
//     }
//   }, [isSignedIn, user?.id, user?._id, user?.userId, authLoading]);

//   const refetch = useCallback(() => {
//     return mutation.mutate(searchParams);
//   }, [searchParams, mutation.mutate]);

//   const searchJobs = useCallback(
//     (newParams = {}) => {
//       const mergedParams = { ...initialParams, ...newParams };
//       setSearchParams(mergedParams);
//       return mutation.mutate(mergedParams);
//     },
//     [initialParams, mutation.mutate]
//   );

//   return {
//     mutate: searchJobs,
//     data: lastSearchData || mutation.data,
//     isPending: mutation.isPending,
//     isError: mutation.isError,
//     error: mutation.error,
//     isLoading: mutation.isLoading || mutation.isPending || authLoading,
//     isFetching: mutation.isPending,
//     refetch,
//   };
// };
// // export const useJobSearch = (initialParams = {}) => {
// //   return useMutation({
// //     mutationFn: async (searchParams) => {
// //       // Build query parameters
// //       const queryParams = new URLSearchParams();

// //       // Add search term if provided
// //       if (searchParams?.search && searchParams.search.trim()) {
// //         queryParams.append("search", searchParams.search.trim());
// //       }

// //       // Add filters if they're not default values
// //       if (searchParams?.role_needed && searchParams.role_needed !== "all") {
// //         queryParams.append("role_needed", searchParams.role_needed);
// //       }

// //       if (searchParams?.niches && searchParams.niches !== "all") {
// //         queryParams.append("niches", searchParams.niches);
// //       }

// //       if (searchParams?.minBudget && searchParams.minBudget !== "") {
// //         queryParams.append("minBudget", searchParams.minBudget);
// //       }

// //       if (searchParams?.maxBudget && searchParams.maxBudget !== "") {
// //         queryParams.append("maxBudget", searchParams.maxBudget);
// //       }

// //       if (searchParams?.sort && searchParams.sort !== "newest") {
// //         queryParams.append("sort", searchParams.sort);
// //       }

// //       // Construct the URL
// //       const url = `/api/jobs/active?${queryParams.toString()}`;

// //       const { data } = await api.get(url);
// //       return data;
// //     },
// //     onError: (error) => {
// //       console.error("Job search error:", error);
// //     },
// //     onSuccess: (data) => {},
// //   });
// // };

// // Hook for getting a single job by ID
// export const useJob = (jobId, options = {}) => {
//   return useQuery({
//     queryKey: ["job", jobId],
//     queryFn: async ({ queryKey, signal }) => {
//       const [_key, id] = queryKey;

//       if (!id) {
//         throw new Error("Job ID is required");
//       }

//       console.log("Fetching job with ID:", id);

//       const { data } = await api.get(`/api/jobs/${id}`, { signal });
//       console.log("Single job response:", data);
//       return data;
//     },
//     enabled: !!jobId, // Only run query if jobId is provided
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     refetchOnWindowFocus: false,
//     ...options,
//   });
// };

// // Alternative implementation using useQuery if you prefer that approach:
// export const useJobSearchQuery = (searchParams, options = {}) => {
//   return useQuery({
//     queryKey: ["job-search", searchParams],
//     queryFn: async ({ queryKey, signal }) => {
//       const [_key, params] = queryKey;

//       // Build query parameters
//       const queryParams = new URLSearchParams();

//       if (params?.search && params.search.trim()) {
//         queryParams.append("search", params.search.trim());
//       }

//       if (params?.role_needed && params.role_needed !== "all") {
//         queryParams.append("role_needed", params.role_needed);
//       }

//       if (params?.niches && params.niches !== "all") {
//         queryParams.append("niches", params.niches);
//       }

//       if (params?.minBudget && params.minBudget !== "") {
//         queryParams.append("minBudget", params.minBudget);
//       }

//       if (params?.maxBudget && params.maxBudget !== "") {
//         queryParams.append("maxBudget", params.maxBudget);
//       }

//       if (params?.sort && params.sort !== "newest") {
//         queryParams.append("sort", params.sort);
//       }

//       const url = queryParams.toString()
//         ? `/api/jobs/active?${queryParams.toString()}`
//         : "/api/jobs/active";

//       const { data } = await api.get(url, { signal });
//       return data;
//     },
//     enabled: true,
//     refetchOnWindowFocus: false,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     ...options,
//   });
// };

// // --- Single job by ID (with custom JWT token) ------------------------------------

// const fetchJobById = async ({ queryKey, signal }) => {
//   const [_key, id] = queryKey;
//   if (!id) throw new Error("jobId is required");

//   const token = await getValidAccessToken();
//   if (!token) throw new Error("No valid access token available");

//   const { data } = await api.get(`/api/jobs/${id}`, {
//     signal,
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   console.log("data by id res", data);
//   return data;
// };

// export const useJobById = (id, options = {}) => {
//   const { isSignedIn, isLoaded } = useAuth();

//   return useQuery({
//     queryKey: ["job", id],
//     queryFn: fetchJobById,
//     enabled: !!id && isLoaded && isSignedIn,
//     staleTime: 60_000,
//     refetchOnWindowFocus: false,
//     ...options,
//   });
// };

// // useJobApplications.js

// export const useJobApplications = (
//   jobId,
//   page = 1,
//   limit = 10,
//   options = {}
// ) => {
//   const { isLoaded, isSignedIn } = useAuth();

//   return useQuery({
//     queryKey: ["job-applications", { jobId, page, limit }],
//     enabled: Boolean(jobId) && isLoaded && isSignedIn, // wait for auth & require id
//     queryFn: async ({ queryKey, signal }) => {
//       const [_key, p] = queryKey;
//       if (!p.jobId) throw new Error("jobId is required");

//       const token = await getValidAccessToken();
//       if (!token) throw new Error("No valid access token available");

//       const { data } = await api.get(`/api/jobs/${p.jobId}/applications`, {
//         params: { page: p.page, limit: p.limit }, // -> ?page=1&limit=10
//         signal,
//         headers: {
//           Authorization: `Bearer ${token}`, // change to JWT/Token if your API expects it
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

// // Job Status Completed Endpoint
// const jobComletoinMutation = async ({ jobId, applicationId }) => {
//   if (!jobId || !applicationId) {
//     throw new Error("jobId and applicationId are required");
//   }
//   const token = await getValidAccessToken();
//   if (!token) throw new Error("No valid access token available");

//   const { data } = await api.post(
//     `/api/jobs/${jobId}/complete`, // Call the complete job API
//     { freelancerId: applicationId },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`, // change to JWT/Token if your API expects it
//       },
//     } // Send freelancerId in the payload
//   );

//   return data;
// };

// export const useJobCompletion = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: jobComletoinMutation, // Using mutationFn as per the new syntax
//     onSuccess: (jobId) => {
//       queryClient.invalidateQueries({ queryKey: ["job-applications", jobId] });
//     },
//     onError: (error) => {
//       console.log("Error completing job:", error.message);
//     },
//   });
// };

// // Mutation function for canceling the job (Reject)
// const cancelJobFn = async ({ jobId, reason }) => {
//   if (!jobId || !reason) {
//     throw new Error("jobId and reason are required");
//   }

//   const token = await getValidAccessToken();
//   if (!token) throw new Error("No valid access token available");

//   const { data } = await api.post(
//     `/api/jobs/${jobId}/cancel`, // API call to cancel the job
//     { reason }, // Send the reason in the body
//     {
//       headers: {
//         Authorization: `Bearer ${token}`, // Token in Authorization header
//       },
//     }
//   );

//   return data;
// };

// export const useJobReject = () => {
//   // Use the mutation for canceling the job
//   return useMutation({
//     mutationFn: cancelJobFn,
//     onSuccess: (data) => {
//       console.log("Job rejected successfully:", data);
//     },
//     onError: (error) => {
//       console.log("Error rejecting job:", error.message);
//     },
//   });
// };

// // Mutation function for selecting a freelancer
// const selectFreelancerFn = async ({ jobId, applicationId }) => {
//   if (!jobId || !applicationId) {
//     throw new Error("jobId and applicationId are required");
//   }

//   const token = await getValidAccessToken();
//   if (!token) throw new Error("No valid access token available");

//   const { data } = await api.post(
//     { applicationId }, // Send applicationId in the body
//     {
//       headers: {
//         Authorization: `Bearer ${token}`, // Token in Authorization header
//       },
//     }
//   );

//   return data;
// };

// export const useSelectFreelancer = () => {
//   // Use the mutation for selecting the freelancer
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: selectFreelancerFn,
//     onSuccess: (data) => {
//       alert("Freelancer selected successfully:");
//       queryClient.invalidateQueries({ queryKey: ["job-applications"] });
//     },
//     onError: (error) => {
//       alert("Error selecting freelancer:");
//       console.log("Error selecting freelancer:", error.message);
//     },
//   });
// };

// // shortlisted freelancer

// // inside your component
// export const ShortlistMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ jobId, applicationId }) => {
//       const { data } = await api.put(
//         `/api/jobs/${jobId}/applications/${applicationId}`,
//         {
//           status: "shortlisted",
//           notes:
//             "Great portfolio! Love the design style and tech focus. Moving to shortlist for further consideration.",
//         }
//       );
//       return data;
//     },
//     onSuccess: (jobId) => {
//       queryClient.invalidateQueries({ queryKey: ["job-applications", jobId] });
//     },
//   });
// };

// // Freelancer Apply for job

// // Option 1: Modify the hook to accept both jobId and body
// export const useApplyJob = (jobId) =>
//   useMutation({
//     mutationFn: async (body) => {
//       console.log("jobId", jobId, "body", body);
//       const { data } = await api.post(`/api/jobs/${jobId}/apply`, body);
//       return data;
//     },
//   });
