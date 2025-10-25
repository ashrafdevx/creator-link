// components/reviews/ReviewForm.jsx (usage)
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send, User, Loader2 } from "lucide-react";
import {
  useOrderReviews,
  useSubmitOrderReview,
  useOrderReviewEligibility,
} from "@/hooks/useOrderReviews";
import { toast } from "sonner";

const DUMMY_ORDER_ID = "65fa3c2be1a79b9c9b0d1234";

export default function ReviewForm({
  orderId,
  freelancerName,
  projectTitle,
}) {
  const effectiveOrderId = orderId || DUMMY_ORDER_ID;

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [error, setError] = useState("");

  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    isError,
    error: reviewsError,
    refetch,
  } = useOrderReviews(effectiveOrderId);

  const {
    data: eligibilityData,
    isLoading: isLoadingEligibility,
    refetch: refetchEligibility,
  } = useOrderReviewEligibility(effectiveOrderId);

  const reviews = reviewsData?.reviews || [];

  const { mutateAsync: submitReview, isPending: isSubmitting } =
    useSubmitOrderReview(effectiveOrderId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!effectiveOrderId) return setError("Missing order id.");
    if (rating < 1 || rating > 5)
      return setError("Please select a rating (1–5).");
    if (reviewText.length > 1000)
      return setError("Review must be ≤ 1000 characters.");

    try {
      await submitReview({
        rating,
        review_text: reviewText.trim(),
      });
      setRating(0);
      setHoveredRating(0);
      setReviewText("");
      // Refresh eligibility to hide the form
      await refetchEligibility();
      toast.success("Review submitted successfully!");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit review.";
      setError(msg);
    }
  };

  const renderStarRating = () => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const v = i + 1;
        const active = v <= (hoveredRating || rating);
        return (
          <button
            key={v}
            type="button"
            className={`transition-colors ${
              active
                ? "text-yellow-400"
                : "text-slate-600 hover:text-yellow-300"
            }`}
            onMouseEnter={() => setHoveredRating(v)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(v)}
          >
            <Star className={`h-8 w-8 ${active ? "fill-yellow-400" : ""}`} />
          </button>
        );
      })}
      <span className="ml-3 text-white font-semibold text-lg">
        {rating ? `${rating}/5` : "Select rating"}
      </span>
    </div>
  );

  // Check if user has already submitted a review
  const hasAlreadyReviewed = !isLoadingEligibility &&
    eligibilityData?.canReview === false &&
    eligibilityData?.reason?.includes('already submitted');

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl text-white">
              {hasAlreadyReviewed ? "Review Submitted" : "Post a Review"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="bg-slate-700/30 rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-slate-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-slate-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">
                    {freelancerName || "Alex Rodriguez"}
                  </h3>
                  <p className="text-slate-400">
                    Project:{" "}
                    {projectTitle || "YouTube Thumbnail Design Package"}
                  </p>
                  <Badge className="mt-2 bg-green-600/20 text-green-400 border-green-600">
                    Project Completed
                  </Badge>
                </div>
              </div>
            </div>

            {hasAlreadyReviewed ? (
              <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Star className="h-12 w-12 text-green-400 fill-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-green-400 mb-2">
                  Thank you for your review!
                </h3>
                <p className="text-slate-300">
                  You have successfully submitted your review for this project.
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      How would you rate this freelancer?
                    </h3>
                    <div className="bg-slate-700/30 rounded-lg p-6">
                      {renderStarRating()}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Textarea
                      placeholder="Describe your experience…"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="min-h-32 bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
                      maxLength={1000}
                    />
                    <div className="text-sm text-slate-400 text-right">
                      {reviewText.length}/1000
                    </div>
                  </div>

                  {error && <div className="text-sm text-red-400">{error}</div>}

                  <div className="bg-slate-700/30 rounded-lg p-6">
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        rating === 0 ||
                        reviewText.trim().length < 5
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />{" "}
                          Submitting…
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" /> Submit Review
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <div className="bg-slate-700/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Existing Reviews
                    </h3>
                    <Button
                      variant="outline"
                      onClick={() => refetch()}
                      className="border-slate-600 text-slate-200 hover:bg-slate-700"
                    >
                      Refresh
                    </Button>
                  </div>

                  {isLoadingReviews ? (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading
                      reviews...
                    </div>
                  ) : isError ? (
                    <div className="text-red-400 text-sm">
                      {reviewsError?.message || "Failed to load reviews."}
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-slate-400 text-sm">No reviews yet.</div>
                  ) : (
                    <ul className="space-y-3">
                      {reviews.map((r) => (
                        <li
                          key={r.id || r._id}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-yellow-400">
                              {"★".repeat(r.rating)}{" "}
                              {"☆".repeat(5 - (r.rating || 0))}
                            </div>
                            <div className="text-xs text-slate-500">
                              {r.createdAt
                                ? new Date(r.createdAt).toLocaleString()
                                : ""}
                            </div>
                          </div>
                          {r.review_text && (
                            <p className="mt-2 text-slate-200">{r.review_text}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
