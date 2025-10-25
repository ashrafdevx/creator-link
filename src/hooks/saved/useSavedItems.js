import { useQuery } from "@tanstack/react-query";
import { saveService } from "@/api/saveService";

export const useSavedItems = (itemType = null, page = 1) => {
  return useQuery({
    queryKey: ['saved-items', itemType, page],
    queryFn: async () => {
      const params = { page, limit: 25, withDetails: false };

      if (itemType) {
        // Fetch specific type
        params.itemType = itemType;
        return saveService.getSavedItems(params);
      } else {
        // Fetch all items by combining jobs and gigs
        const [jobsResponse, gigsResponse] = await Promise.all([
          saveService.getSavedItems({ ...params, itemType: 'job' }),
          saveService.getSavedItems({ ...params, itemType: 'gig' })
        ]);

        // Combine the results
        const combinedItems = [
          ...(jobsResponse.data?.data?.savedItems || []),
          ...(gigsResponse.data?.data?.savedItems || [])
        ];

        // Sort by saved date (most recent first)
        combinedItems.sort((a, b) =>
          new Date(b.saved_at || b.createdAt) - new Date(a.saved_at || a.createdAt)
        );

        // Create combined response structure
        return {
          data: {
            data: {
              savedItems: combinedItems,
              pagination: {
                total: combinedItems.length,
                page: 1,
                totalPages: 1
              }
            }
          }
        };
      }
    },
  });
};

export const useCheckSaved = (itemType, itemId) => {
  return useQuery({
    queryKey: ['saved-status', itemType, itemId],
    queryFn: () => saveService.checkIfSaved(itemType, itemId),
    enabled: !!(itemType && itemId),
  });
};