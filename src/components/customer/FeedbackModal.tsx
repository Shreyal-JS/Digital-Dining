import React, { useState } from "react";
import { Button } from "@/components/common/Button";
import { X, Star } from "lucide-react";

interface FeedbackModalProps {
  restaurantId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  restaurantId,
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          rating,
          comment: comment.trim() || undefined,
          languageCode: "en",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to submit feedback");
      }

      setSubmitted(true);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-xl font-bold">
              ✓
            </div>
            <h3 className="text-lg font-bold text-stone-900">Thank you!</h3>
            <p className="text-xs text-stone-500">Your feedback helps us make the dining experience even better.</p>
            <Button variant="outline" size="sm" onClick={onClose} className="mt-4">
              Return to Menu
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">Share Your Experience</h3>
              <p className="text-xs text-stone-500 mt-0.5">How was your visit today?</p>
            </div>

            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? "text-amber-500 fill-amber-500" : "text-stone-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Comments */}
            <div>
              <label htmlFor="feedback-comment" className="block text-xs font-semibold text-stone-700 mb-1">
                Comments (Optional)
              </label>
              <textarea
                id="feedback-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you love or what can we improve?"
                className="w-full text-xs rounded-lg border border-stone-300 p-2.5 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {errorMsg && <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">{errorMsg}</p>}

            <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
              Submit Feedback
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
