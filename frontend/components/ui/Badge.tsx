import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "live" | "ready" | "expiring" | "expired" | "recording" | "scheduled" | "processing" | "yellow" | "default";
  size?: "sm" | "md";
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  dot = false,
}) => {
  const sizeStyles = {
    sm: "text-xs px-2 py-0.5 font-medium",
    md: "text-xs px-2.5 py-1 font-semibold",
  };

  const variantStyles = {
    live: "bg-red-50 text-red-600 border border-red-200",
    recording: "bg-red-600 text-white border border-red-700",
    ready: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    expiring: "bg-amber-50 text-amber-800 border border-amber-300 font-bold",
    expired: "bg-aviation-lightGray text-aviation-muted border border-aviation-border line-through",
    scheduled: "bg-aviation-offWhite text-aviation-charcoal border border-aviation-border",
    processing: "bg-blue-50 text-blue-700 border border-blue-200",
    yellow: "bg-aviation-yellow/20 text-aviation-black border border-aviation-yellow font-bold",
    default: "bg-gray-100 text-gray-700 border border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === "live" || variant === "recording"
              ? "bg-red-500 animate-live-pulse"
              : variant === "ready"
              ? "bg-emerald-500"
              : variant === "expiring"
              ? "bg-amber-500 animate-live-pulse"
              : "bg-gray-400"
          }`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
