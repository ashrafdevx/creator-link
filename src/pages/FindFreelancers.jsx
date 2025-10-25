import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  AlertCircle,
  Users,
  MessageCircle,
  User as UserIcon,
  Search,
  Star,
  X,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ServiceCard from "../components/services/ServiceCard";
import FreelancerCard from "../components/freelancers/FreelancerCard";
import OnlineStatus from "../components/users/OnlineStatus";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFreelancerSearch } from "@/hooks/Freelancer/useFreelancer";
import { useAuth } from "@/hooks/useAuth";

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

// Mock data function for online freelancers (to be replaced with actual API call)
const fetchAllFreelancers = async () => {
  // Static data representing /api/users/online endpoint response
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

  return [
    {
      id: "1",
      full_name: "Alex Johnson",
      public_name: "Alex J.",
      profile_image_url:
        "https://ui-avatars.com/api/?name=Alex+Johnson&background=6366f1&color=fff",
      headline: "Expert Gaming Long Form Editor",
      bio: "5+ years experience editing gaming content for top YouTubers. Specialized in storytelling and retention hooks.",
      roles: ["Long Form Editor", "Short Form Editor"],
      niches: ["Gaming", "Tech"],
      is_online: true,
      last_active: new Date().toISOString(),
      activity_score: 92,
      rating: 4.9,
      reviews_count: 127,
      response_rate: 95,
      services: [{ starting_price: 150 }, { starting_price: 75 }],
    },
    {
      id: "2",
      full_name: "Sarah Chen",
      public_name: "Sarah C.",
      profile_image_url:
        "https://ui-avatars.com/api/?name=Sarah+Chen&background=ec4899&color=fff",
      headline: "Thumbnail Designer & Brand Specialist",
      bio: "Creative thumbnail designer with a focus on high CTR designs. Helped creators increase their view rates by 40%.",
      roles: ["Thumbnail Design", "Channel Strategy"],
      niches: ["Beauty", "Educational", "Tech"],
      is_online: true,
      last_active: new Date().toISOString(),
      activity_score: 88,
      rating: 4.8,
      reviews_count: 94,
      response_rate: 92,
      services: [{ starting_price: 50 }, { starting_price: 200 }],
    },
    {
      id: "3",
      full_name: "Marcus Rivera",
      public_name: "Marcus R.",
      profile_image_url:
        "https://ui-avatars.com/api/?name=Marcus+Rivera&background=10b981&color=fff",
      headline: "Scriptwriter & Content Strategist",
      bio: "Professional scriptwriter specializing in educational and finance content. Masters in Communications.",
      roles: ["Scriptwriting", "Channel Strategy"],
      niches: ["Finance", "Educational"],
      is_online: true,
      last_active: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      activity_score: 85,
      rating: 4.7,
      reviews_count: 156,
      response_rate: 89,
      services: [{ starting_price: 100 }],
    },
    {
      id: "4",
      full_name: "Emma Thompson",
      public_name: "Emma T.",
      profile_image_url:
        "https://ui-avatars.com/api/?name=Emma+Thompson&background=f97316&color=fff",
      headline: "Animation & Motion Graphics Expert",
      bio: "Award-winning animator creating engaging motion graphics for YouTube creators and brands.",
      roles: ["Animation", "Thumbnail Design"],
      niches: ["Comedy", "Educational", "Gaming"],
      is_online: false,
      last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      activity_score: 78,
      rating: 4.9,
      reviews_count: 89,
      response_rate: 88,
      services: [{ starting_price: 300 }, { starting_price: 125 }],
    },
    {
      id: "5",
      full_name: "David Kim",
      public_name: "David K.",
      profile_image_url:
        "https://ui-avatars.com/api/?name=David+Kim&background=8b5cf6&color=fff",
      headline: "Sports Content Editor & Clipping Specialist",
      bio: "Specialized in fast-paced sports editing and creating viral clips. Worked with major sports channels.",
      roles: ["Clipping", "Long Form Editor"],
      niches: ["Sports", "IRL"],
      is_online: true,
      last_active: new Date().toISOString(),
      activity_score: 91,
      rating: 4.6,
      reviews_count: 203,
      response_rate: 87,
      services: [{ starting_price: 80 }, { starting_price: 120 }],
    },
    {
      id: "6",
      full_name: "Maya Patel",
      public_name: "Maya P.",
      profile_image_url:
        "https://ui-avatars.com/api/?name=Maya+Patel&background=06b6d4&color=fff",
      headline: "Beauty & Lifestyle Content Creator",
      bio: "Expert in beauty content editing with 3+ years experience. Known for color grading and aesthetic appeal.",
      roles: ["Short Form Editor", "Thumbnail Design"],
      niches: ["Beauty", "IRL"],
      is_online: true,
      last_active: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      activity_score: 82,
      rating: 4.8,
      reviews_count: 67,
      response_rate: 94,
      services: [{ starting_price: 60 }, { starting_price: 45 }],
    },
    {
      id: "7",
      full_name: "James Wilson",
      public_name: "James W.",
      profile_image_url:
        "https://ui-avatars.com/api/?name=James+Wilson&background=dc2626&color=fff",
      headline: "SEO/Title Optimization Expert",
      bio: "Data-driven content strategist focused on maximizing discoverability and growth through strategic SEO.",
      roles: ["SEO/Title Optimization", "Channel Strategy"],
      niches: ["Tech", "Finance", "Educational"],
      is_online: false,
      last_active: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      activity_score: 95,
      rating: 4.9,
      reviews_count: 234,
      response_rate: 98,
      services: [{ starting_price: 25 }, { starting_price: 150 }],
    },
    {
      id: "8",
      full_name: "Luna Rodriguez",
      public_name: "Luna R.",
      profile_image_url:
        "https://ui-avatars.com/api/?name=Luna+Rodriguez&background=f59e0b&color=fff",
      headline: "Comedy Content Editor & Timing Expert",
      bio: "Specialized in comedy timing and pacing. Helped comedy creators grow their channels with perfect comedic cuts.",
      roles: ["Long Form Editor", "Clipping"],
      niches: ["Comedy", "IRL"],
      is_online: true,
      last_active: new Date().toISOString(),
      activity_score: 87,
      rating: 4.7,
      reviews_count: 112,
      response_rate: 91,
      services: [{ starting_price: 110 }, { starting_price: 65 }],
    },
    {
      id: "9",
      full_name: "Ethan Brooks",
      public_name: "Ethan B.",
      profile_image_url:
        "https://ui-avatars.com/api/?name=Ethan+Brooks&background=7c3aed&color=fff",
      headline: "Tech Review Video Specialist",
      bio: "Former tech journalist turned video editor. Expert in product showcase and tech explanation videos.",
      roles: ["Long Form Editor", "Scriptwriting"],
      niches: ["Tech", "Educational"],
      is_online: false,
      last_active: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      activity_score: 83,
      rating: 4.5,
      reviews_count: 178,
      response_rate: 86,
      services: [{ starting_price: 95 }, { starting_price: 140 }],
    },
    {
      id: "10",
      full_name: "Zoe Martinez",
      public_name: "Zoe M.",
      profile_image_url:
        "https://ui-avatars.com/api/?name=Zoe+Martinez&background=059669&color=fff",
      headline: "Educational Content Animation Specialist",
      bio: "Creating engaging educational animations and explainer videos. Background in instructional design.",
      roles: ["Animation", "Educational"],
      niches: ["Educational", "Finance"],
      is_online: true,
      last_active: new Date().toISOString(),
      activity_score: 89,
      rating: 4.8,
      reviews_count: 145,
      response_rate: 93,
      services: [{ starting_price: 200 }, { starting_price: 85 }],
    },
    {
      id: "11",
      full_name: "Ryan O'Connor",
      public_name: "Ryan O.",
      profile_image_url:
        "https://ui-avatars.com/api/?name=Ryan+OConnor&background=ea580c&color=fff",
      headline: "Gaming Montage & Highlight Creator",
      bio: "Master of gaming montages and highlight reels. Specialized in competitive gaming and esports content.",
      roles: ["Clipping", "Short Form Editor"],
      niches: ["Gaming", "Sports"],
      is_online: true,
      last_active: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      activity_score: 94,
      rating: 4.6,
      reviews_count: 267,
      response_rate: 89,
      services: [{ starting_price: 55 }, { starting_price: 90 }],
    },
    {
      id: "12",
      full_name: "Aisha Hassan",
      public_name: "Aisha H.",
      profile_image_url:
        "https://ui-avatars.com/api/?name=Aisha+Hassan&background=be123c&color=fff",
      headline: "Finance YouTuber Content Strategist",
      bio: "Specialized in finance and business content. Helped multiple finance channels reach 6-figure subscriber counts.",
      roles: ["Channel Strategy", "Scriptwriting"],
      niches: ["Finance", "Educational"],
      is_online: false,
      last_active: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      activity_score: 91,
      rating: 4.9,
      reviews_count: 198,
      response_rate: 96,
      services: [{ starting_price: 120 }, { starting_price: 250 }],
    },
    {
      id: "13",
      full_name: "Tyler Jackson",
      public_name: "Tyler J.",
      profile_image_url:
        "https://ui-avatars.com/api/?name=Tyler+Jackson&background=0d9488&color=fff",
      headline: "Multi-Platform Content Adapter",
      bio: "Expert in adapting content for multiple platforms. TikTok, YouTube Shorts, Instagram Reels specialist.",
      roles: ["Short Form Editor", "Clipping"],
      niches: ["Beauty", "Comedy", "IRL"],
      is_online: true,
      last_active: new Date().toISOString(),
      activity_score: 86,
      rating: 4.4,
      reviews_count: 89,
      response_rate: 85,
      services: [{ starting_price: 35 }, { starting_price: 70 }],
    },
    {
      id: "14",
      full_name: "Isabella Foster",
      public_name: "Isabella F.",
      profile_image_url:
        "https://ui-avatars.com/api/?name=Isabella+Foster&background=7c2d12&color=fff",
      headline: "Luxury Lifestyle & Brand Content Editor",
      bio: "Premium content editing for luxury lifestyle and high-end brand channels. Cinematic quality guaranteed.",
      roles: ["Long Form Editor", "Thumbnail Design"],
      niches: ["Beauty", "IRL"],
      is_online: false,
      last_active: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      activity_score: 88,
      rating: 4.9,
      reviews_count: 76,
      response_rate: 92,
      services: [{ starting_price: 180 }, { starting_price: 95 }],
    },
    {
      id: "15",
      full_name: "Noah Williams",
      public_name: "Noah W.",
      profile_image_url:
        "https://ui-avatars.com/api/?name=Noah+Williams&background=1f2937&color=fff",
      headline: "Beginner-Friendly All-Rounder",
      bio: "New to freelancing but eager to learn! Offering competitive rates while building experience. Great communication.",
      roles: ["Short Form Editor", "Thumbnail Design"],
      niches: ["Gaming", "Comedy"],
      is_online: true,
      last_active: new Date().toISOString(),
      activity_score: 72,
      rating: 4.2,
      reviews_count: 23,
      response_rate: 97,
      services: [{ starting_price: 25 }, { starting_price: 40 }],
    },
  ];
};

export default function FindFreelancers() {
  const { user, isSignedIn } = useAuth();
  const [services, setServices] = useState([]);
  // const [onlineFreelancers, setOnlineFreelancers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [viewMode, setViewMode] = useState("freelancers"); // 'services' or 'freelancers' - default to freelancers for public page
  const [filters, setFilters] = useState({
    role: "all",
    niche: "all",
    min_rate: "",
    max_rate: "",
    min_rating: 0,
    active_only: false,
    availability: "all",
    search: "",
    sort: "activity",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    hasMore: true,
  });
  const navigate = useNavigate();
  // debounce search only
  const debouncedSearch = useDebouncedValue(filters.search, 450);
  const debouncedFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const { data, isLoading, isFetching, isError, error } =
    useFreelancerSearch(debouncedFilters);

  const onlineFreelancers = data?.data || [];
  // Filter out current user's own profile if they're a freelancer
  const filteredFreelancers = onlineFreelancers.filter(
    (freelancer) => freelancer._id !== user?.user?._id
  );

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setIsLoading(true);
  //     setLoadingError(null);

  //     try {
  //       console.log("Starting to fetch data...");
  //       // Fetch online freelancers (primary content for public page)
  //       console.log("Fetching online freelancers...");
  //       const onlineUsers = await fetchAllFreelancers();
  //       console.log("Online freelancers loaded:", onlineUsers.length);
  //       setOnlineFreelancers(onlineUsers);

  //       // Optionally load services for dual-mode functionality
  //       let servicesData = [];
  //       let profilesData = [];
  //       try {
  //         if (typeof Service !== "undefined" && Service.list) {
  //           console.log("Fetching services...");
  //           servicesData = await Service.list();
  //           console.log("Services loaded:", servicesData.length);
  //         }

  //         if (
  //           typeof FreelancerProfile !== "undefined" &&
  //           FreelancerProfile.list
  //         ) {
  //           console.log("Fetching freelancer profiles...");
  //           profilesData = await FreelancerProfile.list();
  //           console.log("Profiles loaded:", profilesData.length);
  //         }
  //       } catch (serviceError) {
  //         console.log(
  //           "Services not available, focusing on freelancer listings"
  //         );
  //       }

  //       console.log("Fetching user profiles...");
  //       let usersData = [];
  //       try {
  //         usersData = await User.list();
  //         console.log("Users loaded:", usersData.length);
  //       } catch (userError) {
  //         console.log("Users not available, creating mock data...");
  //         // Create mock user data based on profile IDs
  //         usersData = profilesData.map((profile, index) => ({
  //           id: profile.user_id,
  //           full_name: `User ${index + 1}`,
  //           public_name: `Specialist ${index + 1}`,
  //           profile_image_url: `https://ui-avatars.com/api/?name=User+${
  //             index + 1
  //           }&background=6366f1&color=fff`,
  //           picture: `https://ui-avatars.com/api/?name=User+${
  //             index + 1
  //           }&background=6366f1&color=fff`,
  //           bio: `Professional ${profile.roles?.[0] || "Specialist"}`,
  //           is_active: true,
  //           last_active: new Date().toISOString(),
  //           activity_score: 70 + Math.random() * 30,
  //           response_rate: 85 + Math.random() * 15,
  //         }));
  //       }

  //       // Filter active services
  //       const activeServices = servicesData.filter(
  //         (service) => service.is_active !== false
  //       );
  //       console.log("Active services:", activeServices.length);

  //       // Create maps for efficient lookup
  //       const usersMap = new Map(usersData.map((u) => [u.id, u]));
  //       const profilesMap = new Map(
  //         profilesData.map((p) => [
  //           p.id,
  //           { ...p, user: usersMap.get(p.user_id) },
  //         ])
  //       );

  //       // Create services with complete profile and user data, filtering out any missing links
  //       const servicesWithProfiles = activeServices
  //         .map((service) => ({
  //           ...service,
  //           freelancer: profilesMap.get(service.freelancer_profile_id),
  //         }))
  //         .filter((service) => service.freelancer && service.freelancer.user);

  //       console.log(
  //         "Services with complete data:",
  //         servicesWithProfiles.length
  //       );

  //       setServices(servicesWithProfiles);

  //       // Try to load favorites if user is logged in and Favorite API is available
  //       if (currentUser && typeof Favorite !== "undefined" && Favorite.filter) {
  //         try {
  //           const favoritesData = await Favorite.filter({
  //             user_id: currentUser.id,
  //             item_type: "service",
  //           });
  //           setFavorites(favoritesData);
  //         } catch (favError) {
  //           console.warn("Failed to load favorites:", favError);
  //           setFavorites([]);
  //         }
  //       } else {
  //         console.log("Favorites not available - guest user or API not loaded");
  //       }
  //     } catch (error) {
  //       console.error("Critical error loading services data:", error);
  //       setLoadingError({
  //         message: error.message,
  //         isPermission: error.message.includes("401"),
  //       });
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  const handleFavoriteToggle = async (itemId, itemType) => {
    if (!user) {
      // For guest users, show a friendly message encouraging signup
      if (
        window.confirm(
          "Sign up to save your favorite freelancers and get notified when they're available! Would you like to create an account?"
        )
      ) {
        navigate("/auth");
      }
      return;
    }

    if (typeof Favorite === "undefined" || !Favorite.create) {
      console.warn("Favorites functionality not available");
      return;
    }

    try {
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
    } catch (error) {
      console.warn("Favorite toggle failed:", error);
    }
  };

  const handleViewDetails = (serviceId) => {
    navigate(createPageUrl(`ServiceDetails?id=${serviceId}`));
  };

  const handleViewFreelancerProfile = (freelancerId) => {
    navigate(`/freelancer/${freelancerId}`);
  };

  const handleContactFreelancer = (freelancerId) => {
    if (!user) {
      // For guest users, show signup prompt with value proposition
      if (
        window.confirm(
          "Sign up to contact freelancers directly and start your project! Create your free account now?"
        )
      ) {
        navigate("/auth");
      }
      return;
    }
    navigate(createPageUrl(`Messages?contact=${freelancerId}`));
  };

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      if (filters.role !== "all" && service.role !== filters.role) return false;
      if (filters.niche !== "all" && !service.niches?.includes(filters.niche))
        return false;
      if (filters.budget !== "all") {
        const [min, max] = filters.budget.split("-").map(Number);
        if (
          max &&
          (service.starting_price < min || service.starting_price > max)
        )
          return false;
        if (!max && service.starting_price < min) return false;
      }
      if (filters.delivery !== "all") {
        const deliveryDays = service.delivery_time_days || 7;
        if (filters.delivery === "1-3" && deliveryDays > 3) return false;
        if (
          filters.delivery === "4-7" &&
          (deliveryDays < 4 || deliveryDays > 7)
        )
          return false;
        if (filters.delivery === "7+" && deliveryDays <= 7) return false;
      }
      return true;
    });
  }, [services, filters]);

  // const filteredFreelancers = useMemo(() => {
  //   return onlineFreelancers.filter((freelancer) => {
  //     // Role filter
  //     if (filters.role !== "all" && !freelancer.roles?.includes(filters.role))
  //       return false;

  //     // Niche filter
  //     if (
  //       filters.niche !== "all" &&
  //       !freelancer.niches?.includes(filters.niche)
  //     )
  //       return false;

  //     // Online/Active filter
  //     if (filters.active_only && !freelancer.is_online) return false;

  //     // Availability filter
  //     if (
  //       filters.availability !== "all" &&
  //       freelancer.availability !== filters.availability
  //     )
  //       return false;

  //     // Price range filter
  //     if (
  //       (filters.min_rate || filters.max_rate) &&
  //       freelancer.services?.length > 0
  //     ) {
  //       const prices = freelancer.services
  //         .map((s) => s.starting_price)
  //         .filter((p) => p);
  //       if (prices.length > 0) {
  //         const minPrice = Math.min(...prices);
  //         if (filters.min_rate && minPrice < parseFloat(filters.min_rate))
  //           return false;
  //         if (filters.max_rate && minPrice > parseFloat(filters.max_rate))
  //           return false;
  //       }
  //     }

  //     // Rating filter
  //     if (
  //       filters.min_rating > 0 &&
  //       (freelancer.rating || 0) < filters.min_rating
  //     )
  //       return false;

  //     // Search filter
  //     if (filters.search) {
  //       const searchTerm = filters.search.toLowerCase();
  //       const searchableText = [
  //         freelancer.full_name,
  //         freelancer.public_name,
  //         freelancer.headline,
  //         freelancer.bio,
  //         ...(freelancer.roles || []),
  //         ...(freelancer.niches || []),
  //       ]
  //         .join(" ")
  //         .toLowerCase();

  //       if (!searchableText.includes(searchTerm)) return false;
  //     }

  //     return true;
  //   });
  // }, [onlineFreelancers, filters]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-white mb-4" />
          <p className="text-slate-400">Loading services...</p>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center bg-slate-800/50 p-8 rounded-lg border border-red-500/30">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Unable to Load Services
          </h2>
          <p className="text-slate-300 mb-4">{loadingError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
          {viewMode === "services" ? "Browse Services" : "Find Top Freelancers"}
        </h1>
        <p className="mt-4 text-lg text-slate-200">
          {viewMode === "services"
            ? "Discover talented specialists offering professional services for content creators."
            : "Connect with verified content creators ready to bring your vision to life."}
        </p>

        {/* Call-to-Action for Guest Users */}
        {!isSignedIn && viewMode === "freelancers" && (
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30">
            <p className="text-slate-200 mb-3">
              💼 Ready to hire? <strong>Sign up free</strong> to contact
              freelancers and start your project today!
            </p>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              Get Started Free
            </Button>
          </div>
        )}
      </div>

      <Card className="bg-slate-800/50 border-slate-700 mb-8 p-6">
        <div className="space-y-6">
          {/* Filter Header with Results Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-5 w-5 text-slate-400" />
              <h3 className="font-semibold text-white">Filter & Search</h3>
            </div>
            <div className="text-sm text-slate-400">
              {viewMode === "freelancers" ? (
                <span>
                  {filteredFreelancers.length} of {data?.total || 0} freelancers
                </span>
              ) : (
                <span>
                  {filteredServices.length} of {services.length} services
                </span>
              )}
            </div>
          </div>

          {/* Top Row - Search, Online Toggle, Sort */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search freelancers, skills, or niches..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {filters.search && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-slate-400 hover:text-white"
                  onClick={() => setFilters({ ...filters, search: "" })}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Online Toggle for Freelancer View */}
            {viewMode === "freelancers" && (
              <div className="flex items-center">
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      active_only: !filters.active_only,
                    })
                  }
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 w-full justify-center ${
                    filters.active_only
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/25"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${
                      filters.active_only ? "bg-white" : "bg-green-400"
                    }`}
                  />
                  <span className="font-medium">
                    {filters.active_only ? "Online Only" : "Show All"}
                  </span>
                  <Badge
                    variant={filters.active_only ? "secondary" : "outline"}
                    className="ml-1 bg-white/20 text-white border-white/30"
                  >
                    {onlineFreelancers.filter((f) => f.is_online).length}
                  </Badge>
                </button>
              </div>
            )}

            {/* Sort Dropdown */}
            <Select
              value={filters.sort}
              onValueChange={(value) => setFilters({ ...filters, sort: value })}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem
                  value="activity"
                  className="text-white hover:bg-slate-700 focus:bg-slate-700"
                >
                  Most Active
                </SelectItem>
                <SelectItem
                  value="rating_high"
                  className="text-white hover:bg-slate-700 focus:bg-slate-700"
                >
                  Highest Rated
                </SelectItem>
                <SelectItem
                  value="rating_low"
                  className="text-white hover:bg-slate-700 focus:bg-slate-700"
                >
                  Lowest Rated
                </SelectItem>
                <SelectItem
                  value="rate_high"
                  className="text-white hover:bg-slate-700 focus:bg-slate-700"
                >
                  Highest Rate
                </SelectItem>
                <SelectItem
                  value="rate_low"
                  className="text-white hover:bg-slate-700 focus:bg-slate-700"
                >
                  Lowest Rate
                </SelectItem>
                <SelectItem
                  value="reviews"
                  className="text-white hover:bg-slate-700 focus:bg-slate-700"
                >
                  Most Reviews
                </SelectItem>
                <SelectItem
                  value="newest"
                  className="text-white hover:bg-slate-700 focus:bg-slate-700"
                >
                  Newest
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bottom Row - Category Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Role Filter */}
            <Select
              value={filters.role}
              onValueChange={(value) => setFilters({ ...filters, role: value })}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem
                  value="all"
                  className="text-white hover:bg-slate-700 focus:bg-slate-700"
                >
                  All Roles
                </SelectItem>
                {ROLES.map((r) => (
                  <SelectItem
                    key={r}
                    value={r}
                    className="text-white hover:bg-slate-700 focus:bg-slate-700"
                  >
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Niche Filter */}
            <Select
              value={filters.niche}
              onValueChange={(value) =>
                setFilters({ ...filters, niche: value })
              }
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="All Niches" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem
                  value="all"
                  className="text-white hover:bg-slate-700 focus:bg-slate-700"
                >
                  All Niches
                </SelectItem>
                {NICHES.map((n) => (
                  <SelectItem
                    key={n}
                    value={n}
                    className="text-white hover:bg-slate-700 focus:bg-slate-700"
                  >
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range Filters */}
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min $"
                value={filters.min_rate}
                onChange={(e) =>
                  setFilters({ ...filters, min_rate: e.target.value })
                }
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
              />
              <Input
                type="number"
                placeholder="Max $"
                value={filters.max_rate}
                onChange={(e) =>
                  setFilters({ ...filters, max_rate: e.target.value })
                }
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
              />
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 whitespace-nowrap">
                Min Rating:
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        min_rating: star === filters.min_rating ? 0 : star,
                      })
                    }
                    className={`p-1 rounded transition-colors ${
                      star <= filters.min_rating
                        ? "text-yellow-400"
                        : "text-slate-500 hover:text-yellow-300"
                    }`}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        star <= filters.min_rating ? "fill-current" : ""
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Filter (for freelancer view) */}
            {viewMode === "freelancers" && (
              <Select
                value={filters.availability}
                onValueChange={(value) =>
                  setFilters({ ...filters, availability: value })
                }
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="all"
                    className="text-white hover:bg-slate-700 focus:bg-slate-700"
                  >
                    All Status
                  </SelectItem>
                  <SelectItem
                    value="available"
                    className="text-white hover:bg-slate-700 focus:bg-slate-700"
                  >
                    Available
                  </SelectItem>
                  <SelectItem
                    value="busy"
                    className="text-white hover:bg-slate-700 focus:bg-slate-700"
                  >
                    Busy
                  </SelectItem>
                  <SelectItem
                    value="unavailable"
                    className="text-white hover:bg-slate-700 focus:bg-slate-700"
                  >
                    Unavailable
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Active Filters Display */}
          {(filters.role !== "all" ||
            filters.niche !== "all" ||
            filters.search ||
            filters.min_rate ||
            filters.max_rate ||
            filters.min_rating > 0 ||
            filters.active_only ||
            filters.availability !== "all") && (
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-700">
              <span className="text-sm text-slate-400 mr-2">
                Active filters:
              </span>

              {filters.role !== "all" && (
                <Badge
                  variant="secondary"
                  className="bg-blue-600/20 text-blue-300 border-blue-600/30"
                >
                  Role: {filters.role}
                  <button
                    onClick={() => setFilters({ ...filters, role: "all" })}
                    className="ml-2 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.niche !== "all" && (
                <Badge
                  variant="secondary"
                  className="bg-purple-600/20 text-purple-300 border-purple-600/30"
                >
                  Niche: {filters.niche}
                  <button
                    onClick={() => setFilters({ ...filters, niche: "all" })}
                    className="ml-2 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.search && (
                <Badge
                  variant="secondary"
                  className="bg-green-600/20 text-green-300 border-green-600/30"
                >
                  Search: "{filters.search}"
                  <button
                    onClick={() => setFilters({ ...filters, search: "" })}
                    className="ml-2 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {(filters.min_rate || filters.max_rate) && (
                <Badge
                  variant="secondary"
                  className="bg-orange-600/20 text-orange-300 border-orange-600/30"
                >
                  Price: {filters.min_rate || "0"} - {filters.max_rate || "∞"}
                  <button
                    onClick={() =>
                      setFilters({ ...filters, min_rate: "", max_rate: "" })
                    }
                    className="ml-2 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.min_rating > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-600/20 text-yellow-300 border-yellow-600/30"
                >
                  Min {filters.min_rating}★
                  <button
                    onClick={() => setFilters({ ...filters, min_rating: 0 })}
                    className="ml-2 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.active_only && (
                <Badge
                  variant="secondary"
                  className="bg-emerald-600/20 text-emerald-300 border-emerald-600/30"
                >
                  Online Only
                  <button
                    onClick={() =>
                      setFilters({ ...filters, active_only: false })
                    }
                    className="ml-2 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.availability !== "all" && (
                <Badge
                  variant="secondary"
                  className="bg-cyan-600/20 text-cyan-300 border-cyan-600/30"
                >
                  {filters.availability}
                  <button
                    onClick={() =>
                      setFilters({ ...filters, availability: "all" })
                    }
                    className="ml-2 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <button
                onClick={() =>
                  setFilters({
                    role: "all",
                    niche: "all",
                    min_rate: "",
                    max_rate: "",
                    min_rating: 0,
                    active_only: false,
                    availability: "all",
                    search: "",
                    sort: "activity",
                    page: 1,
                    limit: 20,
                  })
                }
                className="ml-2 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Results List */}
          {isLoading ? (
            <p className="text-slate-400">Loading…</p>
          ) : (
            isError && (
              <p className="text-red-400">Error: {String(error?.message)}</p>
            )
          )}
          {isFetching && <p className="text-slate-400">Updating…</p>}
        </div>
      </Card>
      {/* Content Area */}
      {viewMode === "services" ? (
        <>
          {services.length === 0 && !isLoading && !loadingError ? (
            <div className="text-center py-10 bg-slate-800/30 rounded-lg">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-400 text-lg mb-2">No services found</p>
              <p className="text-slate-500 text-sm">
                Create your first service to see it listed here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ServiceCard
                    service={service}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorited={favorites.some(
                      (fav) => fav.item_id === service.id
                    )}
                    onViewDetails={handleViewDetails}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {filteredServices.length === 0 && services.length > 0 && (
            <div className="text-center py-10 bg-slate-800/30 rounded-lg">
              <p className="text-slate-400">
                No services match your selected filters.
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {onlineFreelancers.length === 0 && !isLoading && !loadingError ? (
            <div className="text-center py-10 bg-slate-800/30 rounded-lg">
              <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-400 text-lg mb-2">
                No freelancers online
              </p>
              <p className="text-slate-500 text-sm">
                Check back later or browse available services.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFreelancers.map((freelancer, index) => (
                <motion.div
                  key={freelancer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <FreelancerCard
                    freelancer={freelancer}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorited={favorites.some(
                      (fav) => fav.item_id === freelancer.id
                    )}
                    onViewProfile={handleViewFreelancerProfile}
                    onContactFreelancer={handleContactFreelancer}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {filteredFreelancers.length === 0 && onlineFreelancers.length > 0 && (
            <div className="text-center py-10 bg-slate-800/30 rounded-lg">
              <p className="text-slate-400">
                No freelancers match your selected filters.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
