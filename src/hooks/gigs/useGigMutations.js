import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gigService } from "@/api/gigService";
import { toast } from "sonner";

export const useCreateGig = (options = {}) => {
  const queryClient = useQueryClient();
  const { showToast = true } = options;

  return useMutation({
    mutationFn: gigService.createGig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      queryClient.invalidateQueries({ queryKey: ['my-gigs'] });
      queryClient.invalidateQueries({ queryKey: ['gig-stats'] });
      if (showToast) {
        toast.success("Gig created successfully!");
      }
    },
    onError: (error) => {
      if (showToast) {
        toast.error(error.message || "Failed to create gig");
      }
    }
  });
};

export const useUpdateGig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gigId, updateData }) => gigService.updateGig(gigId, updateData),
    onSuccess: (data, { gigId }) => {
      queryClient.invalidateQueries({ queryKey: ['gig', gigId] });
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      queryClient.invalidateQueries({ queryKey: ['my-gigs'] });
      queryClient.invalidateQueries({ queryKey: ['gig-stats'] });
      toast.success("Gig updated successfully!");
    }
  });
};

export const useDeleteGig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: gigService.deleteGig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      queryClient.invalidateQueries({ queryKey: ['my-gigs'] });
      queryClient.invalidateQueries({ queryKey: ['gig-stats'] });
      toast.success("Gig deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete gig");
    }
  });
};

export const useToggleGigStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gigId, status }) => gigService.toggleGigStatus(gigId, status),
    onSuccess: (data, { gigId, status }) => {
      queryClient.invalidateQueries({ queryKey: ['gig', gigId] });
      queryClient.invalidateQueries({ queryKey: ['my-gigs'] });
      queryClient.invalidateQueries({ queryKey: ['gig-stats'] });
      toast.success(`Gig ${status === 'active' ? 'activated' : 'paused'} successfully!`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update gig status");
    }
  });
};