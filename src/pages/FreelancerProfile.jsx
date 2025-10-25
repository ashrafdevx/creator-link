import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Clock,
  UserIcon,
  Mail,
  MapPin,
  Calendar,
  Award,
  Briefcase,
  Eye,
  CheckCircle,
  Edit,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import OnlineStatus from "../components/users/OnlineStatus";
import { useGetFreelancerProfile } from "@/hooks/Freelancer/useGetFreelancerProfile";
import ProfileEditModal from "@/components/freelancers/FreelancerOwnProfileEditModal";
export default function FreelancerProfile() {
  const { data: apiData, isLoading: isLoadingUser } = useGetFreelancerProfile();

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "F";

  if (isLoadingUser) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!apiData) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <p className="text-slate-400">Freelancer not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-slate-800/50 border-slate-700 mb-8 flex items-center">
          <CardHeader className="flex w-full items-center gap-2">
            <div className="flex  items-center gap-2 w-full justify-between">
              <h3 className="text-lg text-white font-semibold">Edit Profile</h3>
              <ProfileEditModal
                defaultValues={apiData}
                triggerAsChild={
                  <button
                    type="button"
                    className=" rounded-md hover:bg-white/10"
                    aria-label="Edit profile"
                    title="Edit profile"
                  >
                    <Edit className="h-5 w-5 text-white hover:text-blue-400 cursor-pointer" />
                  </button>
                }
              />
            </div>
            {/* <Edit className="h-5 w-5 text-white hover:text-blue-400" /> */}
          </CardHeader>{" "}
        </Card>
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-slate-600">
                  <AvatarImage
                    src={apiData.avatarUrl || apiData.avatar ||
                      (apiData.firstName && apiData.lastName ?
                        `https://ui-avatars.com/api/?name=${apiData.firstName}+${apiData.lastName}&background=6366f1&color=fff` :
                        null)}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-slate-700 text-slate-200 text-2xl">
                    {getInitials(apiData.firstName && apiData.lastName ? `${apiData.firstName} ${apiData.lastName}` : '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {apiData.publicName || (apiData.firstName && apiData.lastName ? `${apiData.firstName} ${apiData.lastName}` : '')}
                    </h1>
                    <Badge className="bg-green-600 text-white ml-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                    <OnlineStatus user={{...apiData, is_online: apiData.onlineStatus === "online"}} />
                  </div>
                  <p className="text-xl text-slate-300 mb-3">
                    {apiData.headline || ''}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    {apiData.location?.city && apiData.location?.country && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{apiData.location.city}, {apiData.location.country}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Member since{" "}
                        {apiData.createdAt && !isNaN(new Date(apiData.createdAt)) ? (
                          new Date(apiData.createdAt).getFullYear()
                        ) : (
                          "Recently"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>
                        {apiData.avgRating || 0} ({apiData.totalReviews || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>
                        {(apiData.profileViews || 0).toLocaleString()} profile views
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {apiData.bio || 'No bio available.'}
              </p>

              {/* Contact Information */}
              <div className="mt-6 pt-6 border-t border-slate-600">
                <h4 className="font-medium text-white mb-3">
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{apiData.email}</span>
                    {apiData.isEmailVerified && <CheckCircle className="h-4 w-4 text-green-400" />}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>
                      Last active:{" "}
                      {apiData.lastActive && !isNaN(new Date(apiData.lastActive)) ? (
                        formatDistanceToNow(new Date(apiData.lastActive), {
                          addSuffix: true,
                        })
                      ) : (
                        "Recently"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Section */}
          {apiData.portfolioItems && apiData.portfolioItems.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {apiData.portfolioItems.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-white">
                          {item.title}
                        </h3>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            View Project
                          </a>
                        )}
                      </div>
                      <p className="text-slate-300 text-sm mb-2">
                        {item.description}
                      </p>
                      {item.category && (
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">Average Rating</span>
                </div>
                <span className="font-semibold text-white">
                  {apiData.avgRating > 0 ? `${apiData.avgRating}/5` : 'No ratings yet'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">Jobs Completed</span>
                </div>
                <span className="font-semibold text-white">
                  {apiData.jobsCompleted || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">Profile Views</span>
                </div>
                <span className="font-semibold text-white">
                  {apiData.profileViews.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">Login Count</span>
                </div>
                <span className="font-semibold text-white">
                  {apiData.loginCount}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">Total Reviews</span>
                </div>
                <span className="font-semibold text-white">
                  {apiData.totalReviews || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Expertise */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-2">Roles</h4>
                <div className="flex flex-wrap gap-2">
                  {apiData.roles.map((role) => (
                    <Badge key={role} className="bg-blue-600 text-white">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Niches</h4>
                <div className="flex flex-wrap gap-2">
                  {apiData.niches.map((niche) => (
                    <Badge
                      key={niche}
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                    >
                      {niche}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {apiData.skills.length > 0 ? (
                    apiData.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-slate-700 text-slate-300"
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm">No skills listed</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Platforms</h4>
                <div className="flex flex-wrap gap-2">
                  {apiData.platforms.length > 0 ? (
                    apiData.platforms.map((platform, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                      >
                        {platform.name || platform}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm">No platforms listed</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                Contact & Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Availability</span>
                  <Badge className={`${
                    apiData.availability === 'available' ? 'bg-green-600' :
                    apiData.availability === 'busy' ? 'bg-yellow-600' : 'bg-red-600'
                  } text-white`}>
                    {apiData.availability}
                  </Badge>
                </div>


                {apiData.website && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Website</span>
                    <a
                      href={apiData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Social Profiles */}
          {apiData.socialProfiles?.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Social Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {apiData.socialProfiles.map((profile, index) => (
                    <a
                      key={index}
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-700/30 rounded transition-colors text-sm"
                    >
                      <span className="capitalize">{profile.platform}</span>
                      <span className="text-slate-400">→</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
