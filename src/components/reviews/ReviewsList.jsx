// src/components/reviews/ReviewsList.jsx
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, ChevronDown, Filter } from "lucide-react";
import ReviewCard from "./ReviewCard";
import { useUserReviews } from "@/hooks/useUserReviews";
import { useUserRating } from "@/hooks/useUserRating";
import { useUserReviewAnalytics } from "@/hooks/useUserReviewAnalytics";

const monthLabel = (y, m) =>
  new Date(y, (m ?? 1) - 1, 1).toLocaleString(undefined, {
    month: "short",
    year: "2-digit",
  });

export default function ReviewsList({
  freelancerId,
  reviews = [],
  totalReviews = 0,
  avgRating = 0,
}) {
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState("all");
  const [showCount, setShowCount] = useState(5);

  // ---- Reviews (list) ----
  const {
    data: reviewsRes,
    isLoading: isLoadingReviews,
    isError: isReviewsError,
    error: reviewsError,
  } = useUserReviews(
    freelancerId,
    { isPublic: true },
    {
      onSuccess: (d) => console.log("reviews success:", d),
      onError: (e) => console.log("reviews failed:", e?.message),
    }
  );

  // Map API -> mock ReviewCard shape
  const mapReview = (r) => {
    if (!r) return null;

    const getOrderTitle = (orderLike) => {
      if (!orderLike) return "Order";
      if (orderLike.title) return orderLike.title;
      if (orderLike.order_number) return `Order ${orderLike.order_number}`;
      return "Order";
    };

    const reviewer = r?.reviewer_id || {};
    const orderSource = r?.order_id || r?.order;

    const order =
      orderSource && typeof orderSource === "object"
        ? {
            _id: orderSource._id || orderSource.id || null,
            title: getOrderTitle(orderSource),
            completed_at: orderSource.completed_at,
          }
        : orderSource
        ? {
            _id: orderSource,
            title: "Order",
          }
        : undefined;

    return {
      _id: r?._id,
      rating: r?.rating ?? 0,
      review_text: r?.review_text || "",
      submitted_at: r?.submitted_at || r?.createdAt,
      reviewer: {
        _id: reviewer?._id || reviewer,
        public_name:
          [reviewer?.firstName, reviewer?.lastName].filter(Boolean).join(" ") ||
          "Client",
        avatar: reviewer?.avatar || undefined,
        location: reviewer?.location || {},
      },
      order,
      helpful_count: r?.helpful_count ?? 0,
    };
  };

  const apiMappedReviews = useMemo(() => {
    const apiReviews = reviewsRes?.data?.reviews || [];
    return apiReviews.map(mapReview).filter(Boolean);
  }, [reviewsRes]);

  const displayReviews =
    apiMappedReviews.length > 0
      ? apiMappedReviews
      : reviews.length > 0
      ? reviews
      : [];

  // ---- Ratings (summary) ----
  const {
    data: ratingRes,
    isLoading: isLoadingRating,
    isError: isRatingError,
    error: ratingError,
  } = useUserRating(freelancerId, {
    onSuccess: (d) => console.log("rating success:", d),
    onError: (e) => console.log("rating failed:", e?.message),
  });

  // ---- Analytics (trends, recent) ----
  const {
    data: analyticsRes,
    isLoading: isLoadingAnalytics,
    isError: isAnalyticsError,
    error: analyticsError,
  } = useUserReviewAnalytics(freelancerId, {
    onSuccess: (d) => console.log("analytics success:", d),
    onError: (e) => console.log("analytics failed:", e?.message),
  });

  const analytics = analyticsRes?.data || {};
  const overall = analytics?.overallStats || {};
  const monthlyTrends = analytics?.monthlyTrends || [];
  const recentFromAnalytics = (analytics?.recentReviews || []).map(mapReview);

  // Prefer API stats in order: rating API -> analytics.overallStats -> computed
  const apiAvg = ratingRes?.data?.avgRating ?? overall?.avgRating;
  const apiTotal =
    ratingRes?.data?.totalReviews ?? overall?.totalReviews ?? undefined;
  const apiBreakdown =
    ratingRes?.data?.ratingBreakdown ?? overall?.ratingBreakdown ?? {};

  // Fallbacks
  const computedAvg =
    avgRating ||
    displayReviews.reduce((s, r) => s + (r.rating || 0), 0) /
      (displayReviews.length || 1);

  const totalCount =
    totalReviews ||
    apiTotal ||
    reviewsRes?.data?.pagination?.totalCount ||
    displayReviews.length;

  const effectiveAvg =
    typeof apiAvg === "number" && !Number.isNaN(apiAvg) ? apiAvg : computedAvg;

  const breakdownRows = [5, 4, 3, 2, 1].map((star) => {
    const countFromApi =
      typeof apiBreakdown?.[String(star)] === "number"
        ? apiBreakdown[String(star)]
        : undefined;

    const fallbackCount = displayReviews.filter(
      (r) => r.rating === star
    ).length;
    const count = countFromApi ?? fallbackCount;
    const percentage = totalCount ? (count / totalCount) * 100 : 0;

    return { rating: star, count, percentage };
  });

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"
        }`}
      />
    ));

  const filteredReviews = displayReviews
    .filter((r) => filterRating === "all" || String(r.rating) === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.submitted_at) - new Date(a.submitted_at);
        case "oldest":
          return new Date(a.submitted_at) - new Date(b.submitted_at);
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    })
    .slice(0, showCount);

  // Monthly bar max (for relative bar heights)
  const maxMonthCount = monthlyTrends.reduce(
    (mx, t) => Math.max(mx, t.reviewCount || 0),
    0
  );

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-white flex items-center gap-3">
          Reviews & Ratings
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            {totalCount} review{totalCount === 1 ? "" : "s"}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Loading / Error states */}
        {(isLoadingReviews || isLoadingRating || isLoadingAnalytics) && (
          <div className="text-slate-400 text-sm">Loading…</div>
        )}
        {isReviewsError && (
          <div className="text-rose-400 text-sm">
            Failed to load reviews: {reviewsError?.message || "Unknown error"}
          </div>
        )}
        {isRatingError && (
          <div className="text-rose-400 text-sm">
            Failed to load rating stats:{" "}
            {ratingError?.message || "Unknown error"}
          </div>
        )}
        {isAnalyticsError && (
          <div className="text-rose-400 text-sm">
            Failed to load analytics:{" "}
            {analyticsError?.message || "Unknown error"}
          </div>
        )}

        {/* Overall Rating Summary */}
        <div className="bg-slate-700/30 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {(effectiveAvg || 0).toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {renderStars(Math.round(effectiveAvg || 0))}
              </div>
              <p className="text-slate-400 text-sm">
                Based on {totalCount} review{totalCount === 1 ? "" : "s"}
              </p>
              {analytics?.generatedAt && (
                <p className="text-xs text-slate-500 mt-1">
                  Analytics updated{" "}
                  {new Date(analytics.generatedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Rating Breakdown (5→1) */}
            <div className="space-y-2">
              {breakdownRows.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-slate-300 text-sm w-6">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-slate-400 text-sm w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics: Monthly Trends */}
        {monthlyTrends.length > 0 && (
          <div className="bg-slate-700/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Monthly trends</h3>
              <span className="text-xs text-slate-400">
                Reviews/month & avg ★
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {monthlyTrends.map((t, idx) => {
                const y = t?._id?.year;
                const m = t?._id?.month;
                const count = t?.reviewCount || 0;
                const avg = t?.avgRating ?? 0;
                const heightPct =
                  maxMonthCount > 0
                    ? Math.round((count / maxMonthCount) * 100)
                    : 0;

                return (
                  <div
                    key={`${y}-${m}-${idx}`}
                    className="flex flex-col items-center"
                  >
                    <div className="h-24 w-6 bg-slate-700 rounded-md overflow-hidden flex items-end">
                      <div
                        className="w-full bg-yellow-400 transition-all"
                        style={{ height: `${heightPct}%` }}
                        title={`${count} reviews`}
                      />
                    </div>
                    <div className="mt-2 text-xs text-slate-300">
                      {monthLabel(y, m)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ★ {avg.toFixed(1)}
                    </div>
                    <div className="text-[11px] text-slate-500">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews List (primary) */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 space-y-6">
            {/* Filters and Sorting */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-slate-400" />
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="All ratings" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All ratings</SelectItem>
                    <SelectItem value="5">5 stars</SelectItem>
                    <SelectItem value="4">4 stars</SelectItem>
                    <SelectItem value="3">3 stars</SelectItem>
                    <SelectItem value="2">2 stars</SelectItem>
                    <SelectItem value="1">1 star</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="newest">Most recent</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="highest">Highest rated</SelectItem>
                  <SelectItem value="lowest">Lowest rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-4">
                    <Star className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-lg">No reviews yet</p>
                    <p className="text-sm">
                      This freelancer hasn't received any reviews matching your
                      filters.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Load More */}
            {filteredReviews.length < displayReviews.length && (
              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-700"
                  onClick={() => setShowCount((prev) => prev + 5)}
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Load More Reviews
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar: Recent from Analytics */}
          {recentFromAnalytics.length > 0 && (
            <div className="sm:w-80 lg:w-96">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">
                  Recent reviews
                </h3>
                <div className="space-y-3">
                  {recentFromAnalytics.slice(0, 5).map((rv) => (
                    <ReviewCard key={`recent-${rv._id}`} review={rv} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
