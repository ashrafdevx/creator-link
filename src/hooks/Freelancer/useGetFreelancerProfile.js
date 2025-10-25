import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const fetchProfile = async () => {
  const { data } = await api.get("/api/users/profile");
  return data.data;
};

export const useGetFreelancerProfile = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchProfile,
  });
};

//
// src/hooks/useUpdateFreelancerProfile.js

const updateProfile = async (payload) => {
  const { data } = await api.put("/api/users/profile", payload);
  return data.data;
};

export const useUpdateFreelancerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(["userProfile"]);
    },
  });
};
