import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  Clock,
  User as UserIcon,
  ArrowRight,
  DollarSign,
  Calendar,
  Bookmark,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function JobCard({
  job,
  creator,
  onApply,
  showApplyButton = true,
  onFavoriteToggle,
  isFavorited,
  onViewDetails,
  hasApplied,
  isOwnJob,
  id,
  creatorProfile,
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
      .toUpperCase() || "C";

  const formatJobTime = (timestamp) => {
    try {
      if (!timestamp) return "No Date";

      // If JSON wrapped or object, normalize it
      const cleanTimestamp =
        typeof timestamp === "string"
          ? timestamp.replace(/^"|"$/g, "")
          : timestamp.$date || timestamp;

      const jobDate = new Date(cleanTimestamp);

      if (isNaN(jobDate.getTime())) {
        return "Invalid Date";
      }

      return format(jobDate, "MMM dd, yyyy"); // e.g., Sep 04, 2025
    } catch (error) {
      console.error("Error formatting job time:", error);
      return "Error Formatting Date";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="bg-slate-800/70 border-slate-700 rounded-xl overflow-hidden h-full flex flex-col group p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-xl text-white line-clamp-2 group-hover:text-blue-400 transition-colors pr-4">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                className={
                  roleColors[job.role_needed] || "bg-gray-100 text-gray-700"
                }
              >
                {job.role_needed}
              </Badge>
              {job.niches?.slice(0, 1).map((niche) => (
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
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-slate-700/50 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(job.id, "job");
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

        <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-grow">
          {job.description}
        </p>

        <div className="flex items-center gap-3 mb-5">
          <Avatar className="h-10  w-10 border-2 border-slate-600">
            <AvatarImage
              src={creator?.profile_image_url}
              name={creator?.name}
            />
            <AvatarFallback name={creator?.name} />
          </Avatar>
          <div>
            <p
              className="font-medium text-slate-200 cursor-pointer"
              onClick={() => creatorProfile(creator?._id)}
            >
              {`${creator?.firstName}  ${creator?.lastName} `}
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={12} />
              <span>Posted {formatJobTime(job.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Pricing and timing */}
        <div className="flex justify-between items-center border-t border-slate-700 pt-3 mt-auto">
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {job.deadline
                ? `Due ${format(new Date(job.deadline), "MMM d")}`
                : "No deadline"}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Budget</div>
            <div className="font-bold text-lg text-green-400">
              ${job.budget}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            onClick={() => onViewDetails(id)}
          >
            View Details
          </Button>
          {
            // showApplyButton &&
            isOwnJob ? (
              <Button className="flex-1" variant="outline" disabled>
                <UserIcon className="mr-2 h-4 w-4" />
                Your Posting
              </Button>
            ) : hasApplied ? (
              <Button className="flex-1" variant="outline" disabled>
                <CheckCircle className="mr-2 h-4 w-4" />
                Applied
              </Button>
            ) : (
              <Button
                className="flex-1 bg-white"
                variant="outline"
                onClick={() => onApply && onApply(job._id)}
              >
                Apply Now
              </Button>
            )
          }
        </div>
      </Card>
    </motion.div>
  );
}
