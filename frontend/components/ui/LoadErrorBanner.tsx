import React from "react";
import { AlertCircle } from "lucide-react";

/** Shown when a dashboard API call fails — we never substitute sample data */
export default function LoadErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        Could not load data: {message}
      </span>
      {onRetry && (
        <button onClick={onRetry} className="font-bold underline whitespace-nowrap">
          Retry
        </button>
      )}
    </div>
  );
}
