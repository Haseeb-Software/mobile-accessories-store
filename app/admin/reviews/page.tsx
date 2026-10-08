"use client";

import { useEffect, useState } from "react";
import { Check, X, Trash2, Star } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminReviewsPage() {
  const [status, setStatus] = useState("PENDING");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchReviews() {
    setLoading(true);
    const res = await fetch(`/api/reviews?status=${status}`);
    const data = await res.json();
    setReviews(data.reviews || []);
    setLoading(false);
  }

  useEffect(() => { fetchReviews(); }, [status]);

  async function moderate(id: string, newStatus: "APPROVED" | "REJECTED") {
    await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    toast.success(`Review ${newStatus.toLowerCase()}`);
    fetchReviews();
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    toast.success("Review deleted");
    fetchReviews();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Reviews</h1>

      <div className="mb-4 flex gap-2">
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${status === s ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-500">Loading...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-ink-500">No {status.toLowerCase()} reviews.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-800">{r.name} <span className="font-normal text-ink-400">on {r.product?.title}</span></p>
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-ink-200"} />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-ink-600">{r.comment}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {status === "PENDING" && (
                    <>
                      <button onClick={() => moderate(r.id, "APPROVED")} className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100"><Check size={16} /></button>
                      <button onClick={() => moderate(r.id, "REJECTED")} className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100"><X size={16} /></button>
                    </>
                  )}
                  <button onClick={() => deleteReview(r.id)} className="rounded-lg bg-ink-100 p-1.5 text-ink-500 hover:bg-ink-200"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
