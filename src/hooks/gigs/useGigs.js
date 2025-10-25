import { useQuery } from "@tanstack/react-query";
import { gigService } from "@/api/gigService";

export const useGigs = (filters = {}) => {
  return useQuery({
    queryKey: ['gigs', filters],
    queryFn: () => gigService.getAllGigs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSearchGigs = (searchParams = {}) => {
  return useQuery({
    queryKey: ['gigs', 'search', searchParams],
    queryFn: () => gigService.searchGigs(searchParams),
    enabled: !!searchParams.search || Object.keys(searchParams).length > 0,
  });
};

export const useMyGigs = (params = {}) => {
  return useQuery({
    queryKey: ['my-gigs', params],
    queryFn: () => gigService.getMyGigs(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGigStats = () => {
  return useQuery({
    queryKey: ['gig-stats'],
    queryFn: () => gigService.getGigStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};