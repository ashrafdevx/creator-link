import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveService } from "@/api/saveService";
import { toast } from "sonner";

export const useSaveItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemType, itemId }) => saveService.saveItem(itemType, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-items'] });
      queryClient.invalidateQueries({ queryKey: ['saved-status'] });
      toast.success("Item saved!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save item");
    }
  });
};

export const useUnsaveItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemType, itemId }) => saveService.unsaveItem(itemType, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-items'] });
      queryClient.invalidateQueries({ queryKey: ['saved-status'] });
      toast.success("Item removed from saved!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove saved item");
    }
  });
};