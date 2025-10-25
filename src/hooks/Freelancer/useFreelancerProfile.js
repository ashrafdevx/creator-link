// useFreelancerProfile.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";
import { getCurrentUser, getValidAccessToken } from "@/utils/authUtils";

// --- Fetch Profile ---
const fetchFreelancerProfile = async ({ signal }) => {
  const token = await getValidAccessToken();
  if (!token) throw new Error("No valid access token available");

  const { data } = await api.get("/api/users/profile", {
    signal,
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// --- Update Profile ---
const updateFreelancerProfile = async (updates) => {
  const token = await getValidAccessToken();
  if (!token) throw new Error("No valid access token available");

  const { data } = await api.put("/api/users/profile", updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// --- Delete Profile ---
const deleteFreelancerProfile = async () => {
  const token = await getValidAccessToken();
  if (!token) throw new Error("No valid access token available");

  const { data } = await api.delete("/api/users/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// --- Hook ---
export const useFreelancerProfile = (options = {}) => {
  const { isSignedIn, isLoaded } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["freelancer", "profile"],
    queryFn: fetchFreelancerProfile,
    enabled: isLoaded && isSignedIn,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    ...options,
  });

  const updateMutation = useMutation({
    mutationFn: updateFreelancerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(["freelancer", "profile"]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFreelancerProfile,
    onSuccess: () => {
      queryClient.removeQueries(["freelancer", "profile"]);
    },
  });

  return {
    ...query,
    updateProfile: updateMutation.mutateAsync,
    deleteProfile: deleteMutation.mutateAsync,
  };
};

// Get Online User
// useUserStatus.js

export const useUserStatus = (userId) => {
  return useQuery({
    queryKey: ["user-status", userId],
    queryFn: async ({ signal }) => {
      const { data } = await api.get(`/api/users/${userId}/status`, { signal });
      return data;
    },
    enabled: !!userId, // only fetch if userId is provided
    refetchInterval: 30_000, // auto-refresh every 30s
  });
};

// Current User With Async await
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    staleTime: 60_000,
  });
};
