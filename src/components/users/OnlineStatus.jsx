import React from "react";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";

export default function OnlineStatus({ user, showLastActive = true }) {
  const getStatusColor = () => {
    if (user?.is_online) return "bg-green-500";

    const lastActive = new Date(user?.last_active);
    const hoursAgo = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);

    if (hoursAgo < 24) return "bg-yellow-500";
    if (hoursAgo < 168) return "bg-orange-500"; // 1 week
    return "bg-red-500";
  };

  const getStatusText = () => {
    if (user?.is_online) return "Online";

    const lastActive = new Date(user?.last_active);
    const hoursAgo = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);

    if (hoursAgo < 1) return "Active recently";
    if (hoursAgo < 24) return "Active today";
    if (hoursAgo < 168) return "Active this week";
    return "Inactive";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-xs text-slate-400">{getStatusText()}</span>
      </div>

      {showLastActive && user?.last_active && !user?.is_online && (
        <span className="text-xs text-slate-500">
          {formatDistanceToNow(new Date(user?.last_active), {
            addSuffix: true,
          })}
        </span>
      )}

     
    </div>
  );
}
