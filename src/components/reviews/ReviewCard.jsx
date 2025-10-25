import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, Flag } from "lucide-react";
import { format } from "date-fns";

export default function ReviewCard({ review }) {
  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"
        }`}
      />
    ));
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
      {/* Review Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-slate-600">
            <AvatarImage
              src={
                review.reviewer?.avatar || review.reviewer?.profile_image_url
              }
              className="object-cover"
            />
            <AvatarFallback className="bg-slate-700 text-slate-200">
              {getInitials(
                review.reviewer?.public_name || review.reviewer?.full_name
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-white">
              {review.reviewer?.public_name ||
                review.reviewer?.full_name ||
                "Anonymous User"}
            </h4>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>{review.reviewer?.location?.country || "Global"}</span>
              <span>•</span>
              <span>{format(new Date(review.submitted_at), "MMM yyyy")}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(review.rating)}
          </div>
          <span className="text-white font-semibold">{review.rating}</span>
        </div>
      </div>

      {/* Project Context */}
      {(review.order || review.order_id) && (
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-medium">
                Order: {(review.order || review.order_id)?.title || "Creative Project"}
              </p>
              <p className="text-slate-400 text-xs">
                Completed:{" "}
                {/* {format(
                  new Date(review?.order?.completed_at || review?.order_id?.completed_at),
                  "MMM dd, yyyy"
                )} */}
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-green-600 text-green-400"
            >
              Completed
            </Badge>
          </div>
        </div>
      )}

      {/* Review Content */}
      <div className="space-y-3">
        <p className="text-slate-300 leading-relaxed">
          {review.review_text || "Great work! Highly recommended."}
        </p>
      </div>
    </div>
  );
}
