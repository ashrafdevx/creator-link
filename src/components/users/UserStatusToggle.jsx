import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  Settings,
  CheckCircle,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserStatusToggle({ 
  user, 
  onStatusUpdate,
  isUpdating = false,
  className = ""
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusToggle = async (newStatus) => {
    if (onStatusUpdate) {
      await onStatusUpdate(newStatus);
    }
  };

  const getStatusDisplay = () => {
    if (user?.is_online) {
      return {
        icon: <Wifi className="h-4 w-4" />,
        text: "Online",
        color: "bg-green-500",
        badge: "bg-green-100 text-green-800"
      };
    }
    return {
      icon: <WifiOff className="h-4 w-4" />,
      text: "Offline",
      color: "bg-gray-500",
      badge: "bg-gray-100 text-gray-800"
    };
  };

  const status = getStatusDisplay();

  return (
    <div className={className}>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${status.color} animate-pulse`} />
              <div>
                <CardTitle className="text-sm font-medium text-white">
                  Availability Status
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Let clients know when you're available
                </CardDescription>
              </div>
            </div>
            <Badge className={status.badge}>
              <div className="flex items-center gap-1">
                {status.icon}
                {status.text}
              </div>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <Button
              variant={user?.is_online ? "default" : "outline"}
              size="sm"
              className={`flex-1 ${
                user?.is_online 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "border-slate-600 text-slate-300 hover:bg-green-600 hover:text-white"
              }`}
              onClick={() => handleStatusToggle(true)}
              disabled={isUpdating}
            >
              {isUpdating && user?.is_online ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Wifi className="h-4 w-4 mr-1" />
              )}
              Online
            </Button>

            <Button
              variant={!user?.is_online ? "default" : "outline"}
              size="sm"
              className={`flex-1 ${
                !user?.is_online 
                  ? "bg-gray-600 hover:bg-gray-700 text-white" 
                  : "border-slate-600 text-slate-300 hover:bg-gray-600 hover:text-white"
              }`}
              onClick={() => handleStatusToggle(false)}
              disabled={isUpdating}
            >
              {isUpdating && !user?.is_online ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <WifiOff className="h-4 w-4 mr-1" />
              )}
              Offline
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-slate-700"
              >
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Last Active:</span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-3 w-3" />
                      {user?.last_active 
                        ? new Date(user.last_active).toLocaleString()
                        : "Never"
                      }
                    </div>
                  </div>
                  
                  {user?.activity_score !== undefined && (
                    <div className="flex items-center justify-between">
                      <span>Activity Score:</span>
                      <Badge
                        className={`text-xs ${
                          user.activity_score > 80
                            ? "bg-green-100 text-green-800"
                            : user.activity_score > 60
                            ? "bg-yellow-100 text-yellow-800"
                            : user.activity_score > 40
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {Math.round(user.activity_score)}%
                      </Badge>
                    </div>
                  )}

                  <div className="text-xs text-slate-500">
                    <p className="mb-1">
                      <strong>Online:</strong> You'll appear in search results and clients can contact you immediately.
                    </p>
                    <p>
                      <strong>Offline:</strong> Your profile is still visible, but clients know you may not respond immediately.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}