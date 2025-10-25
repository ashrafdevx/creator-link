import React, { useMemo, useState } from "react";

/**
 * Crelance Review System — Single-File Functional Demo (mock data)
 * - One component, no external deps beyond React + Tailwind in your app
 * - Shows: System Overview, Core Logic, Business Benefits, Technical Rules
 * - Interactive demo: leave a review (1–5 stars + optional text),
 *   respects: completed order only, both sides, 30-day window, one-per-order
 * - Real-time profile updates: avg rating, totals, distribution, recent reviews
 * - Simple flag + moderation queue demo
 */

// --- Mock Data --------------------------------------------------------------
const now = new Date();
const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

const MOCK_USERS = {
  u1: { id: "u1", name: "Ava Client", role: "Client" },
  u2: { id: "u2", name: "Ben Freelancer", role: "Freelancer" },
  u3: { id: "u3", name: "Cara Freelancer", role: "Freelancer" },
};

const MOCK_orderS = [
  {
    id: "c1",
    title: "YouTube Thumbnail Package (Tech)",
    clientId: "u1",
    freelancerId: "u2",
    status: "completed",
    completedAt: daysAgo(7).toISOString(), // within 30-day window
  },
  {
    id: "c2",
    title: "Shorts Editing — Weekly",
    clientId: "u1",
    freelancerId: "u3",
    status: "completed",
    completedAt: daysAgo(35).toISOString(), // outside 30 days -> ineligible
  },
  {
    id: "c3",
    title: "Channel Strategy Sprint",
    clientId: "u1",
    freelancerId: "u2",
    status: "in_progress",
    completedAt: null,
  },
];

// Some existing reviews (public by default)
const INITIAL_REVIEWS = [
  {
    id: "r1",
    orderId: "c1",
    reviewerId: "u1", // client -> freelancer
    revieweeId: "u2",
    rating: 5,
    text: "Fast turnaround and strong design choices.",
    createdAt: daysAgo(5).toISOString(),
    isPublic: true,
    flagged: false,
  },
];

// --- Helpers ----------------------------------------------------------------
const within30Days = (iso) => {
  if (!iso) return false;
  const done = new Date(iso).getTime();
  const diffDays = (Date.now() - done) / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
};

function computeUserStats(userId, reviews) {
  const mine = reviews.filter((r) => r.revieweeId === userId && r.isPublic);
  const totalReviews = mine.length;
  const sum = mine.reduce((acc, r) => acc + r.rating, 0);
  const avg = totalReviews ? Number((sum / totalReviews).toFixed(2)) : 0;
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  mine.forEach((r) => (breakdown[r.rating] += 1));
  return {
    avg,
    totalReviews,
    breakdown,
    recent: mine.slice().reverse().slice(0, 6),
  };
}

function StarInput({ value, onChange, size = 28 }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`transition-transform active:scale-95 ${
            n <= value ? "opacity-100" : "opacity-40 hover:opacity-70"
          }`}
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={n <= value ? "currentColor" : "none"}
            stroke="currentColor"
            className="text-yellow-400"
            width={size}
            height={size}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.403c.499.036.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.5a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.556L3.04 10.346a.563.563 0 01.321-.988l5.518-.403a.563.563 0 00.475-.345l2.125-5.111z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

function Bar({ label, value, total }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-10 text-slate-300">{label}★</span>
      <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
        <div className="h-2 bg-blue-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-12 text-right text-slate-400">{pct}%</span>
    </div>
  );
}

function ProfileCard({ user, stats }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold text-lg">{user.name}</h3>
          <p className="text-slate-400 text-sm">{user.role}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl text-white font-bold">
            {stats.avg.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400">avg rating</div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {[5, 4, 3, 2, 1].map((n) => (
          <div key={n} className="text-center">
            <div className="text-slate-300 text-xs mb-1">{n}★</div>
            <div className="text-slate-100 text-sm font-semibold">
              {stats.breakdown[n]}
            </div>
          </div>
        ))}
      </div>
      <Bar label={5} value={stats.breakdown[5]} total={stats.totalReviews} />
      <div className="h-1" />
      <Bar label={4} value={stats.breakdown[4]} total={stats.totalReviews} />
      <div className="h-1" />
      <Bar label={3} value={stats.breakdown[3]} total={stats.totalReviews} />
      <div className="h-1" />
      <Bar label={2} value={stats.breakdown[2]} total={stats.totalReviews} />
      <div className="h-1" />
      <Bar label={1} value={stats.breakdown[1]} total={stats.totalReviews} />
      <div className="mt-4 text-slate-400 text-sm">
        Total reviews: {stats.totalReviews}
      </div>
    </div>
  );
}

export default function ReviewSystemDemo() {
  // Current signed-in user (toggle to test both perspectives)
  const [currentUserId, setCurrentUserId] = useState("u1"); // default Ava Client
  const users = MOCK_USERS;

  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [selectedorderId, setSelectedorderId] = useState("c1");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState("");

  // Eligible orders = completed, within 30 days, and user is participant
  const myEligibleorders = useMemo(() => {
    return MOCK_orderS.filter((c) => {
      const participant =
        c.clientId === currentUserId || c.freelancerId === currentUserId;
      return (
        participant && c.status === "completed" && within30Days(c.completedAt)
      );
    });
  }, [currentUserId]);

  // Current selected order details
  const selectedorder = useMemo(
    () => MOCK_orderS.find((c) => c.id === selectedorderId) || null,
    [selectedorderId]
  );

  // Determine the reviewee (the other party in the order)
  const revieweeId = useMemo(() => {
    if (!selectedorder) return null;
    return selectedorder.clientId === currentUserId
      ? selectedorder.freelancerId
      : selectedorder.clientId;
  }, [selectedorder, currentUserId]);

  // Check duplicate: one review per order per user
  const alreadyReviewed = useMemo(() => {
    return reviews.some(
      (r) =>
        r.orderId === selectedorderId && r.reviewerId === currentUserId
    );
  }, [reviews, selectedorderId, currentUserId]);

  // Profile stats (recomputed on every render = "real-time")
  const clientStats = computeUserStats("u1", reviews);
  const freelancer1Stats = computeUserStats("u2", reviews);
  const freelancer2Stats = computeUserStats("u3", reviews);

  function resetForm() {
    setRating(0);
    setText("");
    setIsPublic(true);
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validation per business/technical rules
    if (!selectedorder) return setError("Select a order to review.");
    if (selectedorder.status !== "completed")
      return setError("Reviews are only available after order completion.");
    if (!within30Days(selectedorder.completedAt))
      return setError(
        "The 30-day review window has expired for this order."
      );
    const isParticipant =
      selectedorder.clientId === currentUserId ||
      selectedorder.freelancerId === currentUserId;
    if (!isParticipant)
      return setError("You are not a participant in this order.");
    if (alreadyReviewed)
      return setError("You have already reviewed this order.");
    if (rating < 1 || rating > 5)
      return setError("Rating is required (1–5 stars).");
    if (text.length > 500)
      return setError("Review text must be 500 characters or fewer.");

    const newReview = {
      id: `r${reviews.length + 1}`,
      orderId: selectedorder.id,
      reviewerId: currentUserId,
      revieweeId,
      rating,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      isPublic,
      flagged: false,
    };
    setReviews((prev) => [newReview, ...prev]);
    resetForm();
  }

  function toggleFlag(reviewId, flag) {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, flagged: flag } : r))
    );
  }

  const moderationQueue = reviews.filter((r) => r.flagged);

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 flex items-end justify-between gap-4">
          {/* Switch current user to test both sides */}
          <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-xl p-2">
            <span className="text-sm text-slate-300 mr-2">Acting as:</span>
            {Object.values(users).map((u) => (
              <button
                key={u.id}
                onClick={() => setCurrentUserId(u.id)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  currentUserId === u.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: narrative cards */}

          {/* Right column: interactive system */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profiles snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ProfileCard user={users.u1} stats={clientStats} />
              <ProfileCard user={users.u2} stats={freelancer1Stats} />
              <ProfileCard user={users.u3} stats={freelancer2Stats} />
            </div>

            {/* Review composer */}
            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 shadow-lg">
              <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
                <h3 className="text-lg font-semibold">Leave a Review</h3>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-300">order</label>
                  <select
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                    value={selectedorderId}
                    onChange={(e) => setSelectedorderId(e.target.value)}
                  >
                    {[
                      ...new Set([
                        ...myEligibleorders.map((c) => c.id),
                        selectedorderId,
                      ]),
                    ]
                      .filter(Boolean)
                      .map((id) => {
                        const c = MOCK_orderS.find((x) => x.id === id);
                        if (!c) return null;
                        const eligible = myEligibleorders.some(
                          (ec) => ec.id === c.id
                        );
                        return (
                          <option key={id} value={id}>
                            {c.title} {eligible ? "" : "(ineligible)"}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <div className="text-sm text-slate-300 mb-2">Rating *</div>
                  <StarInput value={rating} onChange={setRating} />
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-slate-300 mb-2">
                    Optional feedback (max 500)
                  </div>
                  <textarea
                    className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                    maxLength={500}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What went well? What could be improved?"
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="accent-blue-600"
                      />
                      Public review (default)
                    </label>
                    <span>{text.length}/500</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-3 text-sm text-red-400">{error}</div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Submit Review
                </button>
              </div>
            </section>

            {/* Recent reviews & flagging */}
            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Recent Reviews</h3>
                <span className="text-sm text-slate-400">
                  Public reviews only
                </span>
              </div>
              {reviews.filter((r) => r.isPublic).length === 0 ? (
                <div className="text-slate-400 text-sm">No reviews yet.</div>
              ) : (
                <ul className="space-y-3">
                  {reviews
                    .filter((r) => r.isPublic)
                    .map((r) => {
                      const reviewer = users[r.reviewerId];
                      const reviewee = users[r.revieweeId];
                      return (
                        <li
                          key={r.id}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-yellow-400">
                              {"★".repeat(r.rating)}
                              {"☆".repeat(5 - r.rating)}
                            </div>
                            <div className="text-xs text-slate-500">
                              {new Date(r.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="mt-1 text-sm text-slate-300">
                            <span className="text-slate-400">Reviewer:</span>{" "}
                            {reviewer.name}
                            <span className="mx-2 text-slate-600">→</span>
                            <span className="text-slate-400">
                              Reviewee:
                            </span>{" "}
                            {reviewee.name}
                          </div>
                          {r.text && (
                            <p className="mt-2 text-slate-200">{r.text}</p>
                          )}
                          <div className="mt-3 flex items-center gap-2">
                            {!r.flagged ? (
                              <button
                                onClick={() => toggleFlag(r.id, true)}
                                className="px-3 py-1 rounded-lg bg-amber-600/20 border border-amber-600/40 text-amber-300 text-xs hover:bg-amber-600/30"
                              >
                                Flag for Moderation
                              </button>
                            ) : (
                              <button
                                onClick={() => toggleFlag(r.id, false)}
                                className="px-3 py-1 rounded-lg bg-emerald-600/20 border border-emerald-600/40 text-emerald-300 text-xs hover:bg-emerald-600/30"
                              >
                                Unflag
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                </ul>
              )}
            </section>

            {/* Moderation queue */}
            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Moderation Queue</h3>
                <span className="text-sm text-slate-400">
                  (flagged reviews)
                </span>
              </div>
              {moderationQueue.length === 0 ? (
                <div className="mt-2 text-slate-400 text-sm">
                  No items in queue.
                </div>
              ) : (
                <ul className="mt-3 space-y-3">
                  {moderationQueue.map((r) => (
                    <li
                      key={r.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-300">
                          <span className="text-slate-400">Review ID:</span>{" "}
                          {r.id}
                          <span className="mx-2 text-slate-600">|</span>
                          <span className="text-slate-400">order:</span>{" "}
                          {r.orderId}
                        </div>
                        <button
                          onClick={() => toggleFlag(r.id, false)}
                          className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs"
                        >
                          Resolve
                        </button>
                      </div>
                      <p className="mt-2 text-slate-200">
                        {r.text || "(no text)"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-500">
          Demo only — all data and updates are in-memory.
        </footer>
      </div>
    </div>
  );
}
