"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

type Review = { id: string; name: string; rating: number; comment: string; createdAt: string };

export default function ReviewSection({
  productId,
  reviews,
  avgRating,
}: {
  productId: string;
  reviews: Review[];
  avgRating: number | null;
}) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      toast.error("Please fill in your name and review");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, name, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      toast.success(data.message || "Review submitted for approval");
      setName("");
      setComment("");
      setRating(5);
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-12">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink-900">Customer Reviews</h2>
          {avgRating && (
            <div className="mt-1 flex items-center gap-1 text-sm text-ink-500">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {avgRating.toFixed(1)} out of 5 ({reviews.length} reviews)
            </div>
          )}
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-outline text-sm">
          Write a Review
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitReview} className="card mb-6 space-y-3 p-4">
          <div>
            <label className="label">Your Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your name" />
          </div>
          <div>
            <label className="label">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)}>
                  <Star size={22} className={n <= rating ? "fill-amber-400 text-amber-400" : "text-ink-200"} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Your Review</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="input" rows={3} placeholder="Share your experience..." />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-ink-500">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-ink-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-ink-200"} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-ink-800">{r.name}</span>
                <span className="text-xs text-ink-400">{format(new Date(r.createdAt), "MMM d, yyyy")}</span>
              </div>
              <p className="mt-1.5 text-sm text-ink-600">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
