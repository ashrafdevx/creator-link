import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  MessageCircle,
  Clock,
  Bookmark,
  DollarSign,
  Eye,
  User as UserIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import OnlineStatus from "../users/OnlineStatus";

export default function FreelancerCard({
  freelancer,
  onContactFreelancer,
  onViewProfile,
  onFavoriteToggle,
  isFavorited,
  showContactButton = true,
}) {
  const roleColors = {
    "Long Form Editor": "bg-blue-100 text-blue-700",
    "Short Form Editor": "bg-orange-100 text-orange-700",
    "Thumbnail Design": "bg-purple-100 text-purple-700",
    Scriptwriting: "bg-green-100 text-green-700",
    "Channel Strategy": "bg-yellow-100 text-yellow-700",
    Clipping: "bg-pink-100 text-pink-700",
    Animation: "bg-indigo-100 text-indigo-700",
    "SEO/Title Optimization": "bg-teal-100 text-teal-700",
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "F";

  const getStartingPrice = () => {
    if (freelancer?.services?.length > 0) {
      const prices = freelancer.services
        .map((s) => s.starting_price)
        .filter((p) => p);
      return prices.length > 0 ? Math.min(...prices) : null;
    }
    return null;
  };

  const startingPrice = getStartingPrice();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="bg-slate-800/70 border-slate-700 rounded-xl overflow-hidden h-full flex flex-col group p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-16 w-16 border-2 border-slate-600">
              <AvatarImage
                src={freelancer?.profile_image_url || freelancer?.picture}
                className="object-cover"
              />
              <AvatarFallback className="bg-slate-700 text-slate-200 text-lg">
                {getInitials(freelancer?.public_name || freelancer?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-white group-hover:text-blue-400 transition-colors">
                {freelancer?.public_name ||
                  freelancer?.full_name ||
                  "Freelancer"}
              </h3>
              <p className="text-slate-400 text-sm mb-2">
                {freelancer?.headline || "Creative Professional"}
              </p>
              <OnlineStatus user={freelancer} showLastActive={true} />
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-slate-700/50 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.(freelancer?.id, "freelancer");
            }}
          >
            <Bookmark
              className={`h-5 w-5 transition-all ${
                isFavorited
                  ? "fill-yellow-400 text-yellow-400 scale-110"
                  : "text-white"
              }`}
            />
          </Button>
        </div>

        {/* Bio/Description */}
        {freelancer?.bio && (
          <p className="text-slate-400 text-sm mb-4 line-clamp-3 flex-grow">
            {freelancer.bio}
          </p>
        )}

        {/* Roles/Skills */}
        {freelancer?.roles?.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {freelancer.roles.slice(0, 3).map((role) => (
                <Badge
                  key={role}
                  className={roleColors[role] || "bg-gray-100 text-gray-700"}
                >
                  {role}
                </Badge>
              ))}
              {freelancer.roles.length > 3 && (
                <Badge
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  +{freelancer.roles.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Niches */}
        {freelancer?.niches?.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {freelancer.niches.slice(0, 2).map((niche) => (
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
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
          <div className="flex items-center gap-4">
            {freelancer?.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{freelancer.rating.toFixed(1)}</span>
                <span>({freelancer.reviews_count || 0})</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing and Actions */}
        <div className="flex justify-between items-center border-t border-slate-700 pt-4 mt-auto">
          <div className="text-left">
            <div className="text-xs text-slate-400">Starting at</div>
            <div className="font-bold text-lg text-green-400">
              {startingPrice ? `$${startingPrice}` : "Custom Quote"}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-black hover:bg-slate-700 hover:text-white"
              onClick={() => onViewProfile?.(freelancer?.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Profile
            </Button>
            {showContactButton && (
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                onClick={() => onContactFreelancer?.(freelancer?.id)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Contact
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
