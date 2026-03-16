import { useState } from "react";
import { Loader2, X } from "lucide-react";

interface ReviewFeedbackFormProps {
  onSubmit: (feedback: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ReviewFeedbackForm({
  onSubmit,
  onCancel,
  loading = false,
}: ReviewFeedbackFormProps) {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    await onSubmit(feedback.trim());
    setFeedback("");
  };

  return (
    <div className="space-y-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
      <p className="text-sm font-medium text-red-700 dark:text-red-300">
        Rejection Feedback
      </p>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Explain why this item is being rejected..."
        className="w-full px-3 py-2 text-sm border border-red-300 dark:border-red-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-red-500 focus:border-red-500"
        rows={3}
        disabled={loading}
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={loading || !feedback.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
          Reject with Feedback
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-3 py-1.5 text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
