import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Plus } from "lucide-react";
import GigCard from "../../components/gigs/GigCard";
import SaveButton from "../../components/saved/SaveButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGigs, useSearchGigs } from "@/hooks/gigs/useGigs";
import { toast } from "sonner";

const GIG_CATEGORIES = [
  "Video Editing",
  "Graphic Design",
  "Content Writing",
  "Social Media Management",
  "SEO Optimization",
  "Animation",
  "Web Development",
  "Photography",
  "Audio Editing",
  "Thumbnail Design",
  "Scriptwriting",
  "Channel Strategy",
];

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function BrowseGigs() {
  const { user, isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    minPrice: "",
    maxPrice: "",
    deliveryTime: "all",
    sort: "newest",
  });

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 500);

  // Build search parameters
  const searchParams = useMemo(() => {
    const params = {};

    if (debouncedSearchTerm?.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    if (filters.category !== "all") {
      params.category = filters.category;
    }

    if (filters.minPrice) {
      params.minPrice = filters.minPrice;
    }

    if (filters.maxPrice) {
      params.maxPrice = filters.maxPrice;
    }

    if (filters.deliveryTime !== "all") {
      params.deliveryTime = filters.deliveryTime;
    }

    // Add sorting parameters
    if (filters.sort && filters.sort !== "newest") {
      const sortMap = {
        "newest": { sortBy: "createdAt", sortOrder: "desc" },
        "oldest": { sortBy: "createdAt", sortOrder: "asc" },
        "price_low": { sortBy: "price_low", sortOrder: "asc" },
        "price_high": { sortBy: "price_high", sortOrder: "desc" },
        "rating": { sortBy: "createdAt", sortOrder: "desc" } // fallback until rating is implemented
      };

      const sortConfig = sortMap[filters.sort];
      if (sortConfig) {
        params.sortBy = sortConfig.sortBy;
        params.sortOrder = sortConfig.sortOrder;
      }
    }

    return params;
  }, [debouncedSearchTerm, filters]);

  // Fetch gigs
  const {
    data: gigsData,
    isLoading,
    error
  } = useGigs(searchParams);

  const gigs = gigsData?.data?.data?.gigs || [];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      category: "all",
      minPrice: "",
      maxPrice: "",
      deliveryTime: "all",
      sort: "newest",
    });
  };

  const handleViewDetails = (gigId) => {
    navigate(`/gigs/${gigId}`);
  };

  const handleCreateGig = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to create a gig");
      return;
    }
    if (user?.role !== "freelancer") {
      toast.error("Only freelancers can create gigs");
      return;
    }
    navigate("/gigs/create");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="container mx-auto">
          <Card className="bg-red-100 border-red-300">
            <CardContent className="p-6">
              <p className="text-red-700">Error loading gigs: {error.message}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Browse Gigs</h1>
              <p className="text-slate-400">Find the perfect freelance services for your projects</p>
            </div>

            {isSignedIn && user?.role === "freelancer" && (
              <Button
                onClick={handleCreateGig}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Gig
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <Card className="bg-slate-800/70 border-slate-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* Search */}
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search gigs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                {/* Category Filter */}
                <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {GIG_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Price Range */}
                <Input
                  placeholder="Min Price"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />

                <Input
                  placeholder="Max Price"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />

                {/* Sort */}
                <Select value={filters.sort} onValueChange={(value) => handleFilterChange("sort", value)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-between items-center">
                <p className="text-slate-400 text-sm">
                  {isLoading ? "Loading..." : `${gigs.length} gigs found`}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gigs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/70 border-slate-700 h-80 animate-pulse">
                    <div className="p-5 space-y-4">
                      <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                      <div className="h-20 bg-slate-600 rounded"></div>
                      <div className="h-8 bg-slate-600 rounded w-1/3"></div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : gigs.length > 0 ? (
              gigs.map((gig, index) => (
                <motion.div
                  key={gig._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GigCard
                    gig={gig}
                    onViewDetails={handleViewDetails}
                    showSaveButton={isSignedIn}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-12"
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">No gigs found</h3>
                  <p className="text-slate-400 mb-4">Try adjusting your search criteria</p>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Clear Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}