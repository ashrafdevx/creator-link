import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Star,
  Globe,
  ExternalLink,
  Briefcase,
  TrendingUp,
  Youtube,
  Linkedin,
  Twitter,
  Instagram,
  Github,
  Facebook,
  DollarSign,
  Clock,
  Eye,
  Award,
  User,
  Heart,
  MessageCircle,
  Languages,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { usePublicFreelancer } from "@/hooks/Freelancer/usePublicFreelancerProfile";
import ReviewsList from "@/components/reviews/ReviewsList";


const makePlaceholder = (firstName = "", lastName = "") => {
  const f = (firstName || "").trim()[0] || "";
  const l = (lastName || "").trim()[0] || "";
  const initials = `${f}${l}`.toUpperCase() || "U";
  return `https://placehold.co/150x150?text=${encodeURIComponent(initials)}`;
};

// Normalize a single portfolio item
const normalizePortfolioItem = (p) => {
  if (!p || typeof p !== "object") {
    // If API ever returns strings/urls directly
    return {
      _id: null,
      title: null,
      description: null,
      url: String(p ?? ""),
      thumbnail: null,
      type: null,
      tags: [],
      createdAt: null,
    };
  }

  return {
    _id: p._id ?? p.id ?? null,
    title: p.title ?? p.name ?? null,
    description: p.description ?? p.desc ?? null,
    url: p.url ?? p.link ?? p.mediaUrl ?? null,
    thumbnail: p.thumbnail ?? p.thumb ?? p.thumbnailUrl ?? null,
    type: p.type ?? p.category ?? null,
    tags: Array.isArray(p.tags) ? p.tags : [],
    createdAt: p.createdAt ?? null,
  };
};

const mapFreelancerApiData = (api) => {
  const location = api?.location || {};
  const platforms = Array.isArray(api?.platforms) ? api.platforms : [];
  const socials = Array.isArray(api?.socialProfiles) ? api.socialProfiles : [];
  const portfolio = Array.isArray(api?.portfolioItems)
    ? api.portfolioItems
    : [];

  const websiteFromSocials =
    socials.find(
      (s) =>
        (s.platform || s.name || s.type)?.toLowerCase() === "website" && s.url
    )?.url || null;

  return {
    _id: api?._id ?? api?.id ?? "",
    publicName: `${api?.firstName ?? ""} ${api?.lastName ?? ""}`.trim(),
    firstName: api?.firstName ?? "",
    lastName: api?.lastName ?? "",
    headline: null,
    bio: api?.bio ?? "",
    avatar:
      api?.avatarUrl ||
      api?.avatar ||
      makePlaceholder(api?.firstName, api?.lastName),
    website: websiteFromSocials,

    location: {
      country: location.country ?? null,
      city: location.city ?? null,
    },

    skills: Array.isArray(api?.skills) ? api.skills : [],
    roles: Array.isArray(api?.roles) ? api.roles : [],
    niches: Array.isArray(api?.niches) ? api.niches : [],

    availability: api?.availability ?? null,

    jobsCompleted: api?.jobsCompleted ?? 0,
    avgRating: api?.avgRating ?? 0,
    totalReviews: api?.totalReviews ?? 0,
    profileViews: api?.profileViews ?? 0,

    lastActive: api?.lastActive ?? null,
    createdAt: api?.createdAt ?? null,

    platforms: platforms.map((p) => ({
      name: p.name ?? p.platform ?? "",
      url: p.url ?? p.link ?? null,
      followerCount:
        typeof p.followerCount === "number" ? p.followerCount : null,
      isPublic: typeof p.isPublic === "boolean" ? p.isPublic : true,
    })),
    primaryPlatform: platforms[0]?.name ?? platforms[0]?.platform ?? null,

    publicSocialProfiles: socials.map((s) => ({
      platform: s.platform ?? s.name ?? s.type ?? "website",
      url: s.url ?? s.link ?? "",
      isPublic: typeof s.isPublic === "boolean" ? s.isPublic : true,
    })),

    portfolioItems: portfolio.map(normalizePortfolioItem),
  };
};


export default function FreelancerPublicProfile() {
  const navigate = useNavigate();
  const { freelancerId } = useParams();
  // Api call to fetch freelancer profile
  const { user: currentUser, isLoadedin, isSignedIn } = useAuth();

  const {
    data: freelancerData,
    isLoading: isLoadingFreelancer,
    isError: isErrorFreelancer,
    error: errorFreelancer,
  } = usePublicFreelancer(freelancerId);

  const freelancerProfile = mapFreelancerApiData(freelancerData);
  const handleBackClick = () => {
    navigate("/");
  };

  const handlePortfolioView = (portfolioId) => {
    window.open(portfolioId, '_blank');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "F";
  };

  const getRoleColor = (role) => {
    const colors = {
      "Long Form Editor": "bg-blue-100 text-blue-800 border-blue-200",
      "Short Form Editor": "bg-green-100 text-green-800 border-green-200",
      "Thumbnail Design": "bg-purple-100 text-purple-800 border-purple-200",
      Animation: "bg-orange-100 text-orange-800 border-orange-200",
      "Script Writing": "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return colors[role] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getNicheColor = (niche) => {
    const colors = {
      Gaming: "bg-red-100 text-red-800",
      Tech: "bg-indigo-100 text-indigo-800",
      Beauty: "bg-pink-100 text-pink-800",
      Finance: "bg-emerald-100 text-emerald-800",
      Educational: "bg-violet-100 text-violet-800",
      Entertainment: "bg-rose-100 text-rose-800",
    };
    return colors[niche] || "bg-slate-100 text-slate-800";
  };

  const getSkillColor = (index) => {
    const colors = [
      "bg-cyan-100 text-cyan-800",
      "bg-amber-100 text-amber-800",
      "bg-lime-100 text-lime-800",
      "bg-teal-100 text-teal-800",
      "bg-fuchsia-100 text-fuchsia-800",
      "bg-sky-100 text-sky-800",
    ];
    return colors[index % colors.length];
  };

  const getSocialIcon = (platform) => {
    const icons = {
      youtube: Youtube,
      linkedin: Linkedin,
      twitter: Twitter,
      instagram: Instagram,
      facebook: Facebook,
      github: Github,
      website: Globe,
    };
    return icons[platform] || Globe;
  };

  const getAvailabilityStatus = (status) => {
    const statusMap = {
      available: {
        text: "Available",
        color: "bg-green-100 text-green-800 border-green-200",
      },
      busy: {
        text: "Busy",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      unavailable: {
        text: "Unavailable",
        color: "bg-red-100 text-red-800 border-red-200",
      },
    };
    return statusMap[status] || statusMap.available;
  };

  const isOnline = () => {
    const now = new Date();
    const lastActive = new Date(freelancerProfile.lastActive);
    const diffMinutes = (now - lastActive) / (1000 * 60);
    return diffMinutes <= 15;
  };

  const availabilityStatus = getAvailabilityStatus(
    freelancerProfile.availability
  );

  if (isLoadingFreelancer || isLoadedin) return <p>Loading…</p>;
  if (isErrorFreelancer) return <p>Error: {errorFreelancer?.message}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={handleBackClick}
            className="border-slate-600 bg-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Hero */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-slate-600 flex-shrink-0">
                      <AvatarImage
                        src={freelancerProfile.avatar}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-purple-600 text-white text-3xl">
                        {getInitials(
                          freelancerProfile.firstName,
                          freelancerProfile.lastName
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline() && (
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-800"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">
                        {freelancerProfile.publicName}
                      </h1>
                      <Badge className="bg-purple-100 text-purple-800 border border-purple-200">
                        <User className="w-3 h-3 mr-1" />
                        Freelancer
                      </Badge>
                      <Badge className={availabilityStatus.color}>
                        {availabilityStatus.text}
                      </Badge>
                    </div>

                    <h2 className="text-xl text-purple-400 mb-4 font-semibold">
                      {freelancerProfile.headline}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">
                          {freelancerProfile.location.city},{" "}
                          {freelancerProfile.location.country}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-300">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm">
                          {freelancerProfile.avgRating} (
                          {freelancerProfile.totalReviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">
                          Member since{" "}
                          {format(
                            new Date(freelancerProfile.createdAt),
                            "MMM yyyy"
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-white">
                          {freelancerProfile.jobsCompleted}
                        </div>
                        <div className="text-sm text-slate-400">Completed</div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-white">
                          {freelancerProfile.avgRating}
                        </div>
                        <div className="text-sm text-slate-400">Rating</div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-white">
                          {freelancerProfile.profileViews}
                        </div>
                        <div className="text-sm text-slate-400">Views</div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-white">
                          {isOnline() ? "Online" : "Offline"}
                        </div>
                        <div className="text-sm text-slate-400">Status</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio Section */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">
                  {freelancerProfile.bio}
                </p>
              </CardContent>
            </Card>

            {/* Skills & Expertise */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-white mb-3">
                      Roles
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {freelancerProfile.roles.map((role) => (
                        <Badge key={role} className={getRoleColor(role)}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-3">
                      Niches
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {freelancerProfile.niches.map((niche) => (
                        <Badge key={niche} className={getNicheColor(niche)}>
                          {niche}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-3">
                      Technical Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {freelancerProfile.skills.map((skill, index) => (
                        <Badge key={skill} className={getSkillColor(index)}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Portfolio (
                  {freelancerProfile?.portfolioItems?.length ?? 0} items)
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Recent work and project highlights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {freelancerProfile?.portfolioItems?.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-700/30 rounded-lg overflow-hidden hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="aspect-video bg-slate-600/50 flex items-center justify-center">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-slate-300 text-sm mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge
                            className={getNicheColor(item.category)}
                            size="sm"
                          >
                            {item.category}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-slate-200 hover:bg-slate-700"
                            onClick={() => handlePortfolioView(item.id)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Profiles */}
            {freelancerProfile.publicSocialProfiles &&
              freelancerProfile.publicSocialProfiles.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Online Presence
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Connect with {freelancerProfile.publicName} on
                      social platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {freelancerProfile.publicSocialProfiles.map(
                        (profile, index) => {
                          const IconComponent = getSocialIcon(profile.platform);
                          return (
                            <a
                              key={index}
                              href={profile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors group"
                            >
                              <IconComponent className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                              <span className="text-sm text-slate-300 group-hover:text-white transition-colors capitalize">
                                {profile.platform === "website"
                                  ? "Website"
                                  : profile.platform}
                              </span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-purple-400 transition-colors ml-auto" />
                            </a>
                          );
                        }
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Jobs Completed</span>
                  <span className="text-white font-semibold">
                    {freelancerProfile.jobsCompleted}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Average Rating</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {freelancerProfile.avgRating}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Reviews</span>
                  <span className="text-white font-semibold">
                    {freelancerProfile.totalReviews}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Profile Views</span>
                  <span className="text-white font-semibold">
                    {freelancerProfile.profileViews}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Response Rate</span>
                  <span className="text-white font-semibold">95%</span>
                </div>
              </CardContent>
            </Card>

            {/* Creator Channels */}
            {freelancerProfile.platforms &&
              freelancerProfile.platforms.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">
                      Creator Channels
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {freelancerProfile.platforms.map(
                      (platform, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Youtube className="w-5 h-5 text-red-400" />
                            <div>
                              <div className="text-white font-medium">
                                {platform.name}
                              </div>
                              <div className="text-slate-400 text-sm">
                                {platform.followerCount.toLocaleString()}{" "}
                                subscribers
                              </div>
                            </div>
                          </div>
                          <a
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-purple-400 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              )}

            {/* Work Preferences */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Work Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Availability</span>
                    <span
                      className={`font-medium ${
                        availabilityStatus.color.includes("green")
                          ? "text-green-400"
                          : availabilityStatus.color.includes("yellow")
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {availabilityStatus.text}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Platform</span>
                    <span className="text-white">
                      {freelancerProfile.primaryPlatform}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Response Time</span>
                    <span className="text-white">~2 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Languages</span>
                    <span className="text-white">English, Spanish</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <ReviewsList
            freelancerId={freelancerProfile._id}
            totalReviews={freelancerProfile.totalReviews}
            avgRating={freelancerProfile.avgRating}
          />
        </div>
      </div>
    </div>
  );
}
