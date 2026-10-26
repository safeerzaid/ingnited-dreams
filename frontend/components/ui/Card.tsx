import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "accent" | "dark";
  padding?: "none" | "sm" | "md" | "lg";
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  hoverEffect = false,
  className = "",
  ...props
}) => {
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const variantStyles = {
    default: "bg-white border border-aviation-border shadow-subtle",
    elevated: "bg-white border border-aviation-border/80 shadow-card",
    accent: "bg-aviation-offWhite border-l-4 border-l-aviation-yellow border-y border-r border-aviation-border",
    dark: "bg-aviation-black text-white border border-aviation-charcoal shadow-elevated",
  };

  const hoverClass = hoverEffect
    ? "transition-all duration-300 hover:shadow-cardHover hover:-translate-y-0.5 hover:border-aviation-charcoal/20"
    : "";

  return (
    <div
      className={`rounded-xl ${paddingStyles[padding]} ${variantStyles[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
