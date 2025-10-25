import React from "react";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, Users } from "lucide-react";

export default function ActivityBadge({ user, type = "full" }) {
  const getResponseRateBadge = () => {
    if (user?.response_rate >= 90)
      return {
        color: "bg-green-100 text-green-800",
        text: "Quick Responder",
        icon: Zap,
      };
    if (user?.response_rate >= 70)
      return {
        color: "bg-yellow-100 text-yellow-800",
        text: "Good Response",
        icon: Clock,
      };
    return {
      color: "bg-red-100 text-red-800",
      text: "Slow Response",
      icon: Clock,
    };
  };

  const getActivityBadge = () => {
    if (user?.activity_score >= 80)
      return {
        color: "bg-blue-100 text-blue-800",
        text: "Highly Active",
        icon: Users,
      };
    if (user?.activity_score >= 60)
      return {
        color: "bg-indigo-100 text-indigo-800",
        text: "Active",
        icon: Users,
      };
    if (user?.activity_score >= 40)
      return {
        color: "bg-purple-100 text-purple-800",
        text: "Moderate",
        icon: Users,
      };
    return {
      color: "bg-gray-100 text-gray-800",
      text: "Low Activity",
      icon: Users,
    };
  };

  if (type === "response") {
    const badge = getResponseRateBadge();
    return (
      <Badge className={`${badge.color} flex items-center gap-1`}>
        <badge.icon className="w-3 h-3" />
        {badge.text}
      </Badge>
    );
  }

  if (type === "activity") {
    const badge = getActivityBadge();
    return (
      <Badge className={`${badge.color} flex items-center gap-1`}>
        <badge.icon className="w-3 h-3" />
        {badge.text}
      </Badge>
    );
  }

  // Full badges
  const responseBadge = getResponseRateBadge();
  const activityBadge = getActivityBadge();

  return (
    <div className="flex gap-2 flex-wrap">
      <Badge className={`${responseBadge.color} flex items-center gap-1`}>
        <responseBadge.icon className="w-3 h-3" />
        {responseBadge.text}
      </Badge>
      <Badge className={`${activityBadge.color} flex items-center gap-1`}>
        <activityBadge.icon className="w-3 h-3" />
        {activityBadge.text}
      </Badge>
    </div>
  );
}
