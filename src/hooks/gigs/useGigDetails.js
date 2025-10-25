import { useQuery } from "@tanstack/react-query";
import { gigService } from "@/api/gigService";

export const useGigDetails = (gigId) => {
  return useQuery({
    queryKey: ['gig', gigId],
    queryFn: () => gigService.getGigById(gigId),
    enabled: !!gigId,
  });
};