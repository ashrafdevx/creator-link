import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  Calendar,
  Users,
  DollarSign,
  MoreVertical,
  Edit3,
  Eye,
  Play,
  Pause,
  Trash2,
  AlertTriangle,
  CheckCircle,
  CircleDot,
  Ban,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";

export default function PostedJobCard({
  job,
  onEdit,
  onViewApplications,
  onToggleStatus,
  onDelete,
  onViewDetails,
}) {
  // Status configuration with colors and icons
  // console.log("job", job);
  const statusConfig = {
    draft: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: CircleDot,
      label: "Draft",
    },
    active: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
      label: "Active",
    },
    completed: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: CheckCircle,
      label: "Completed",
    },
    cancelled: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: Ban,
      label: "Cancelled",
    },
  };

  // Role colors (matching your existing JobCard)
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

  const currentStatus = statusConfig[job?.status];
  const StatusIcon = currentStatus.icon;

  const formatJobTime = (timestamp) => {
    try {
      const jobDate = new Date(timestamp);
      if (isNaN(jobDate.getTime())) {
        return "Recently";
      }
      return formatDistanceToNow(jobDate, { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };

  const getUrgencyIndicator = () => {
    if (!job.deadline) return null;

    const daysRemaining = Math.ceil(
      (new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining <= 0 && job.status === "active") {
      return (
        <div className="flex items-center gap-1 text-red-400">
          <AlertTriangle className="h-3 w-3" />
          <span className="text-xs font-medium">Overdue</span>
        </div>
      );
    } else if (
      daysRemaining <= 3 &&
      daysRemaining > 0 &&
      job.status === "active"
    ) {
      return (
        <div className="flex items-center gap-1 text-orange-400">
          <Clock className="h-3 w-3" />
          <span className="text-xs font-medium">Due soon</span>
        </div>
      );
    }

    return null;
  };

  const getPrimaryAction = () => {
    switch (job.status) {
      case "draft":
        return (
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            onClick={() => onToggleStatus(job.id, "activate")}
          >
            <Play className="mr-2 h-4 w-4" />
            Publish Job
          </Button>
        );
      case "active":
        return (
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            onClick={() => onViewApplications(job.id)}
          >
            <Users className="mr-2 h-4 w-4" />
            View Applications ({job.applicant_count || 0})
          </Button>
        );
      case "completed":
        return (
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => onViewDetails(job.id)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        );
      default:
        return (
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => onEdit(job.id)}
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Job
          </Button>
        );
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="bg-slate-800/70 border-slate-700 rounded-xl overflow-hidden h-full flex flex-col group">
        <div className="p-5 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${currentStatus.color} border`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {currentStatus.label}
                </Badge>
                {getUrgencyIndicator()}
              </div>
              <h3 className="font-bold text-xl text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                {job.title}
              </h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-800 border-slate-700"
              >
                <DropdownMenuItem
                  className="text-slate-200 hover:bg-slate-700"
                  onClick={() => onEdit(job.id)}
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Job
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-slate-200 hover:bg-slate-700"
                  onClick={() => onViewDetails(job.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {job.status === "active" && (
                  <DropdownMenuItem
                    className="text-slate-200 hover:bg-slate-700"
                    onClick={() => onToggleStatus(job.id)}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Draft Job
                  </DropdownMenuItem>
                )}
                {job.status === "draft" && (
                  <DropdownMenuItem
                    className="text-slate-200 hover:bg-slate-700"
                    onClick={() => onToggleStatus(job.id)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Publish Job
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-slate-600" />
                <DropdownMenuItem
                  className="text-red-400 hover:bg-red-900/20"
                  onClick={() => onDelete(job.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Job
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Role and Niches */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge
              className={
                roleColors[job?.role_needed] || "bg-gray-100 text-gray-700"
              }
            >
              {job?.role_needed}
            </Badge>
            {job?.niches?.slice(0, 2).map((niche) => (
              <Badge
                key={niche}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                {niche}
              </Badge>
            ))}
            {job?.niches?.length > 2 && (
              <Badge
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                +{job?.niches.length - 2} more
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-grow">
            {job?.description}
          </p>

          {/* Activity Stats */}
          <div className="flex items-center justify-between mb-4 p-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-slate-400">
                <Users className="h-4 w-4" />
                <span>{job.applicant_count || 0} applicants</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="h-4 w-4" />
                <span>
                  Posted {formatJobTime(job.createdAt || job.created_date)}
                </span>
              </div>
            </div>
            {job.status === "active" && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">Live</span>
              </div>
            )}
          </div>

          {/* Budget and Deadline */}
          <div className="flex justify-between items-center border-t border-slate-700 pt-4 mb-4">
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {job.deadline
                  ? `Due ${format(new Date(job.deadline), "MMM d")}`
                  : "No deadline"}
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Budget</div>
              <div className="font-bold text-lg text-green-400 flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {job.budget}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-auto">
            {getPrimaryAction()}
            {job.status === "active" && (
              <Button
                variant="outline"
                className="border-slate-600 text-white bg-state-800 hover:text-slate-800 hover:bg-white"
                onClick={() => onEdit(job.id)}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
