import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flex, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon, Cross2Icon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import JobCard from "../components/jobs/JobCard";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useFreelancerProfile } from "@/hooks/Freelancer/useFreelancerProfile";
import { useJobSearch, useRecommendJob } from "@/hooks/jobs/useJobSearch";
import { toast } from "sonner";

const ROLES = [
  "Long Form Editor",
  "Short Form Editor",
  "Thumbnail Design",
  "Scriptwriting",
  "Channel Strategy",
  "Clipping",
  "Animation",
  "SEO/Title Optimization",
];
const NICHES = [
  "Gaming",
  "Beauty",
  "Sports",
  "IRL",
  "Finance",
  "Comedy",
  "Tech",
  "Educational",
];

// small debounce util (no external deps)
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function FindJobs() {
  const [favorites, setFavorites] = useState([]);
  const { isLoading: userLoader, user } = useAuth();

  const isFreelancer = user?.user?.role === "freelancer";
  const [appliedJobs, setAppliedJobs] = useState(new Set());
 
  const [term, setTerm] = useState("");
  const [filters, setFilters] = useState({
    role_needed: "all",
    niches: "all",
    minBudget: "",
    maxBudget: "",
    sort: "newest",
  });

  // Combined search parameters for API
  const [searchParams, setSearchParams] = useState({
    search: "",
    role_needed: "all",
    niches: "all",
    minBudget: "",
    maxBudget: "",
    sort: "newest",
  });

  const navigate = useNavigate();
  const debouncedTerm = useDebouncedValue(term, 250);

  // Use the job search hook with search parameters
  const {
    mutate: searchRecommendedJobs,
    data: recommendedJobs,
    isPending: isRecommending,
    isError: isRecommendError,
    error: recommendedJobsError,
    isLoading: isLoadingRecommendedJobs,
    isFetching: isFetchingRecommendedJobs,
    refetch: refetchRecommendedJobs,
  } = useRecommendJob(searchParams);

  const {
    mutate: searchJobs,
    data,
    isPending,
    isError,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useJobSearch(searchParams);
  // Task 1: Load all jobs by default on component mount
  useEffect(() => {
    const initialParams = {
      search: "",
      ...filters,
    };
    setSearchParams(initialParams);
    searchRecommendedJobs(initialParams);
    searchJobs(initialParams);
  }, []); // Only run on mount

  // Task 2: Handle search with enter key and search button
  const handleSearch = useCallback(() => {
    const newSearchParams = {
      search: term.trim(),
      ...filters,
    };
    setSearchParams(newSearchParams);
    searchRecommendedJobs(newSearchParams);
  }, [term, filters, searchRecommendedJobs]);

  // Handle enter key press
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  // Task 3: Handle filter changes with auto-search
  const handleFilterChange = useCallback(
    (filterType, value) => {
      const newFilters = { ...filters, [filterType]: value };
      setFilters(newFilters);

      // Auto-trigger search when filters change
      const newSearchParams = {
        search: term.trim(),
        ...newFilters,
      };

      setSearchParams(newSearchParams);

      // Small delay to batch rapid filter changes
      setTimeout(() => {
        searchJobs(newSearchParams);
      }, 300);
    },
    [filters, term, searchJobs]
  );

  // Handle budget input changes with enter key support
  const handleBudgetChange = useCallback(
    (budgetType, value) => {
      handleFilterChange(budgetType, value);
    },
    [handleFilterChange]
  );

  const handleBudgetKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  // Clear search term
  const clearSearchTerm = useCallback(() => {
    setTerm("");
    const newSearchParams = {
      search: "",
      ...filters,
    };
    setSearchParams(newSearchParams);
    searchJobs(newSearchParams);
  }, [filters, searchJobs]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const defaultFilters = {
      role_needed: "all",
      niches: "all",
      minBudget: "",
      maxBudget: "",
      sort: "newest",
    };

    setFilters(defaultFilters);
    setTerm("");

    const newSearchParams = {
      search: "",
      ...defaultFilters,
    };

    setSearchParams(newSearchParams);
    searchJobs(newSearchParams);
  }, [searchJobs]);

  const handleFavoriteToggle = async (itemId, itemType) => {
    if (!user) {
      toast.error("Please log in to save favorites.");
      return;
    }
    const existingFavorite = favorites.find((fav) => fav.item_id === itemId);
    if (existingFavorite) {
      await Favorite.delete(existingFavorite.id);
      setFavorites(favorites.filter((fav) => fav.id !== existingFavorite.id));
    } else {
      const newFavorite = await Favorite.create({
        user_id: user.id,
        item_id: itemId,
        item_type: itemType,
      });
      setFavorites([...favorites, newFavorite]);
    }
  };

  const handleViewDetails = (jobId) => {
    navigate(createPageUrl(`jobdetails/${jobId}`));
  };

  const handleApply = async (jobId) => {
    navigate(`/JobApplication/${jobId}`);
  };

  const handleViewCreatorProfile = (creatorId) => {
    navigate(`/user/${creatorId}`);
  };

  // Display jobs - only show data if API returned filtered results
  const displayJobs = useMemo(() => {
    // If no data from API, return empty array
    if (!data?.data?.jobs) return [];

    // Check if any filters are active (including search term)
    const hasActiveFilters =
      term.trim() ||
      filters.role_needed !== "all" ||
      filters.niches !== "all" ||
      filters.minBudget ||
      filters.maxBudget ||
      filters.sort !== "newest";

    // If filters are active but no results, return empty array (don't show all data)
    if (hasActiveFilters && data.data.jobs.length === 0) {
      return [];
    }

    // Return the API results as-is (API should handle filtering)
    return data.data.jobs.filter((job) => job.status !== "completed");
  }, [data?.data?.jobs, term, filters]);

  if (isLoading || isFetching || isPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 container mx-auto py-8 px-4">
        {[...Array(6)].map((_, i) => (
          <Card
            key={i}
            className="bg-slate-800/50 border-slate-700 animate-pulse h-64"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-white">
          Find Your Next Gig
        </h1>
        <p className="text-slate-400">
          Browse active job postings from content creators
        </p>
      </div>

      {/* Job Grid */}
      <div className="mt-3">
        
      </div>
      {/* Modern Search Bar */}
      <Card className="bg-slate-800/50 border-slate-700 mb-6">
        <CardContent className="p-6 flex gap-3 items-center justify-center">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search jobs by title, description, or skills..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={onKeyDown}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-10 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              autoComplete="off"
            />
            {term && (
              <button
                type="button"
                onClick={clearSearchTerm}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <Cross2Icon width="16" height="16" />
              </button>
            )}
          </div>
          <div className="flex justify-center">
            <Button
              onClick={handleSearch}
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-full rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {isPending ? "Searching..." : "Search Jobs"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isError && (
        <Card className="bg-red-900/20 border-red-700 mb-6">
          <CardContent className="p-4">
            <p className="text-red-300">Error: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Modern Filter Section */}
      <Card className="bg-slate-800/50 border-slate-700 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            <button
              onClick={clearAllFilters}
              className="border-slate-600 text-slate-800 hover:bg-slate-700 hover:text-white"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Role Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Role</label>
              <Select
                value={filters.role_needed}
                onValueChange={(value) =>
                  handleFilterChange("role_needed", value)
                }
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 transition-colors">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="all"
                    className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white"
                  >
                    All Roles
                  </SelectItem>
                  {ROLES.map((r) => (
                    <SelectItem
                      key={r}
                      value={r}
                      className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white"
                    >
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Niches Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Niche
              </label>
              <Select
                value={filters.niches}
                onValueChange={(value) => handleFilterChange("niches", value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 transition-colors">
                  <SelectValue placeholder="All Niches" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="all"
                    className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white"
                  >
                    All Niches
                  </SelectItem>
                  {NICHES.map((n) => (
                    <SelectItem
                      key={n}
                      value={n}
                      className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white"
                    >
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Budget */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Min Budget
              </label>
              <input
                type="number"
                placeholder="$0"
                value={filters.minBudget}
                onChange={(e) =>
                  handleBudgetChange("minBudget", e.target.value)
                }
                onKeyDown={handleBudgetKeyDown}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Max Budget */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Max Budget
              </label>
              <input
                type="number"
                placeholder="$10000"
                value={filters.maxBudget}
                onChange={(e) =>
                  handleBudgetChange("maxBudget", e.target.value)
                }
                onKeyDown={handleBudgetKeyDown}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Sort By
              </label>
              <Select
                value={filters.sort}
                onValueChange={(value) => handleFilterChange("sort", value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 transition-colors">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="newest"
                    className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white"
                  >
                    Newest First
                  </SelectItem>
                  <SelectItem
                    value="oldest"
                    className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white"
                  >
                    Oldest First
                  </SelectItem>
                  <SelectItem
                    value="budget_high"
                    className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white"
                  >
                    Highest Budget
                  </SelectItem>
                  <SelectItem
                    value="budget_low"
                    className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white"
                  >
                    Lowest Budget
                  </SelectItem>
                  <SelectItem
                    value="deadline"
                    className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white"
                  >
                    By Deadline
                  </SelectItem>
                  <SelectItem
                    value="recommended"
                    className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white"
                  >
                    Recommended
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(term.trim() ||
            filters.role_needed !== "all" ||
            filters.niches !== "all" ||
            filters.minBudget ||
            filters.maxBudget ||
            filters.sort !== "newest") && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-slate-400">Active filters:</span>
                {term.trim() && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600 text-white">
                    Search: "{term}"
                    <button
                      onClick={clearSearchTerm}
                      className="ml-1 hover:text-slate-300"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.role_needed !== "all" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-600 text-white">
                    Role: {filters.role_needed}
                    <button
                      onClick={() => handleFilterChange("role_needed", "all")}
                      className="ml-1 hover:text-slate-300"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.nichse !== "all" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-600 text-white">
                    Niche: {filters.niches}
                    <button
                      onClick={() => handleFilterChange("niches", "all")}
                      className="ml-1 hover:text-slate-300"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.minBudget && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-600 text-white">
                    Min: ${filters.minBudget}
                    <button
                      onClick={() => handleFilterChange("minBudget", "")}
                      className="ml-1 hover:text-slate-300"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.maxBudget && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-600 text-white">
                    Max: ${filters.maxBudget}
                    <button
                      onClick={() => handleFilterChange("maxBudget", "")}
                      className="ml-1 hover:text-slate-300"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.sort !== "newest" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-600 text-white">
                    Sort: {filters.sort.replace("_", " ")}
                    <button
                      onClick={() => handleFilterChange("sort", "newest")}
                      className="ml-1 hover:text-slate-300"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-6">
        {/* Results Count */}
        {displayJobs && (
          <div className="flex justify-between items-center">
            <p className="text-slate-300">
              Found {displayJobs.length} job
              {displayJobs.length !== 1 ? "s" : ""}
              {term.trim() && ` for "${term}"`}
            </p>
          </div>
        )}

        {/* Job Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {displayJobs?.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <JobCard
                  job={job}
                  id={job._id}
                  key={job._id}
                  creator={job.client_id}
                  onApply={handleApply}
                  showApplyButton={!!user}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorited={favorites.some((fav) => fav.item_id === job.id)}
                  onViewDetails={handleViewDetails}
                  hasApplied={appliedJobs.has(job.id)}
                  isOwnJob={job.isOwnJob}
                  creatorProfile={handleViewCreatorProfile}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* No Results Message */}
        {displayJobs?.length === 0 && !isPending && (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">
              No jobs found matching your criteria.
            </p>
            <Button
              onClick={clearAllFilters}
              variant="outline"
              className="border-slate-600 text-slate-800 hover:bg-slate-700 hover:text-white"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
