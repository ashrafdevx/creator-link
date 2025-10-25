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
  Users,
  Building2,
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
} from "lucide-react";
import { format } from "date-fns";
import { usePublicUser } from "@/hooks/client/useClientPublicProfile";
import { useAuth } from "@/hooks/useAuth";

const mapJobsData = (jobsData, { onlyActive = false } = {}) => {
  const src =
    jobsData?.data?.jobs ?? jobsData?.data ?? jobsData?.jobs ?? jobsData ?? [];

  const arr = Array.isArray(src) ? src : [];

  const mapped = arr.map((j) => ({
    id: j._id ?? j.id ?? "", // keep string id; your UI can display as-is
    title: j.title ?? "",
    description: j.description ?? "",
    role_needed: j.role_needed ?? "",
    niches: Array.isArray(j.niches) ? j.niches : [],
    budget: typeof j.budget === "number" ? j.budget : Number(j.budget ?? 0),
    deadline: j.deadline ?? null,
    applicationsCount: j.applicant_count ?? 0,
    status: j.status ?? "active",
    postedDate: j.createdAt ?? null,
  }));

  return onlyActive ? mapped.filter((j) => j.status === "active") : mapped;
};

const mapClientApiData = (api) => {
  const location = api?.location || {};
  const socials = Array.isArray(api?.socialProfiles) ? api.socialProfiles : [];

  const makePlaceholder = (firstName = "", lastName = "") => {
    const f = (firstName || "").trim()[0] || "";
    const l = (lastName || "").trim()[0] || "";
    const initials = `${f}${l}`.toUpperCase() || "U";
    return `https://placehold.co/150x150?text=${encodeURIComponent(initials)}`;
  };

  const titleCase = (s) =>
    typeof s === "string" && s.length
      ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
      : s;

  return {
    _id: api?._id ?? api?.id ?? "",
    firstName: api?.firstName ?? "",
    availability: api?.availability ? titleCase(api.availability) : undefined,
    lastName: api?.lastName ?? "",
    avatar:
      api?.avatarUrl ||
      api?.avatar ||
      makePlaceholder(api?.firstName, api?.lastName),

    companyName: null,
    companySize: null,
    industry: null,

    location: {
      country: location.country ?? null,
      city: location.city ?? null,
      timezone: location.timezone ?? null,
    },

    joinedDate: api?.createdAt ?? null,
    activeJobsCount: api?.activeJobsCount ?? 0,
    jobsPosted: api?.jobsPosted ?? 0,

    publicSocialProfiles: socials.map((s) => ({
      platform: s.platform ?? s.type ?? s.name ?? "website",
      url: s.url ?? s.link ?? "",
      isPublic: typeof s.isPublic === "boolean" ? s.isPublic : true,
    })),
  };
};
export default function ClientPublicProfile() {
  const navigate = useNavigate();
  const { user: currentUser, isLoaded, isSignedIn } = useAuth();
  const { creatorId } = useParams();

  const {
    data: ClientProfile,
    isLoading: isLoadingClient,
    isError: isErrorClient,
    error: errorClient,
    refetch: refetchClient,
  } = usePublicUser(creatorId);

  const clientProfile = mapClientApiData(ClientProfile);

  const handleBackClick = () => {
    navigate("/");
  };

  const handleContactClick = () => {
    alert(
      "This would open the messaging interface to contact this client."
    );
  };

  const handleJobView = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "C";
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

  const getCompanySizeDisplay = (size) => {
    const sizeMap = {
      "1-10": "1-10 employees",
      "11-50": "11-50 employees",
      "51-200": "51-200 employees",
      "201-500": "201-500 employees",
      "500+": "500+ employees",
    };
    return sizeMap[size] || size;
  };
  if (isLoadingClient)
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
  if (isErrorClient) return <p>Error: {errorClient?.message}</p>;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={handleBackClick}
            className="border-slate- bg-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <Avatar className="h-32 w-32 border-4 border-slate-600 flex-shrink-0">
                    <AvatarImage
                      src={
                        ClientProfile?.avatar
                          ? ClientProfile?.avatar
                          : "https://placehold.co/150x150?text=JS"
                      }
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-blue-600 text-white text-3xl">
                      {getInitials(
                        clientProfile.firstName,
                        clientProfile.lastName
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">
                        {clientProfile.firstName}{" "}
                        {clientProfile.lastName}
                      </h1>
                      <Badge className="bg-green-100 text-green-800 border border-green-200">
                        <Building2 className="w-3 h-3 mr-1" />
                        Client
                      </Badge>
                    </div>

                    <h2 className="text-xl text-blue-400 mb-4 font-semibold">
                      {clientProfile.companyName}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                     
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">
                          {clientProfile.location.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">
                          Member since{" "}
                          {format(
                            new Date(clientProfile.joinedDate),
                            "MMM yyyy"
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-white">
                          {ClientProfile?.activeJobsCount}
                        </div>
                        <div className="text-sm text-slate-400">
                          Active Jobs
                        </div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-white">
                          {clientProfile.jobsPosted}
                        </div>
                        <div className="text-sm text-slate-400">
                          Total Posted
                        </div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-white">12</div>
                        <div className="text-sm text-slate-400">Completed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {clientProfile.publicSocialProfiles &&
              clientProfile.publicSocialProfiles.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Online Presence
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Connect with {clientProfile.companyName} on social
                      platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {clientProfile.publicSocialProfiles.map(
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
                              <IconComponent className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                              <span className="text-sm text-slate-300 group-hover:text-white transition-colors capitalize">
                                {profile.platform === "website"
                                  ? "Website"
                                  : profile.platform}
                              </span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-400 transition-colors ml-auto" />
                            </a>
                          );
                        }
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Active Job Postings ({clientProfile.activeJobsCount})
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Current opportunities available from{" "}
                  {clientProfile.companyName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientProfile.activeJobsCount > 0 ? (
                    <p className="text-slate-400 text-center py-8">
                      This client has {clientProfile.activeJobsCount} active job{clientProfile.activeJobsCount > 1 ? 's' : ''}.
                    </p>
                  ) : (
                    <p className="text-slate-400 text-center py-8">
                      No active jobs at the moment.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
          
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Hiring Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">
                      Most Hired Roles
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className={getRoleColor("Thumbnail Design")}
                        size="sm"
                      >
                        Thumbnail Design
                      </Badge>
                      <Badge
                        className={getRoleColor("Long Form Editor")}
                        size="sm"
                      >
                        Long Form Editor
                      </Badge>
                      <Badge className={getRoleColor("Animation")} size="sm">
                        Animation
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">
                      Content Niches
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getNicheColor("Tech")} size="sm">
                        Tech
                      </Badge>
                      <Badge className={getNicheColor("Gaming")} size="sm">
                        Gaming
                      </Badge>
                      <Badge className={getNicheColor("Educational")} size="sm">
                        Educational
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
