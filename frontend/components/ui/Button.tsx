import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "dark" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-lg active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3.5 gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-aviation-yellow text-aviation-black hover:bg-aviation-yellowBright focus:ring-aviation-yellowDeep shadow-subtle hover:shadow-glowYellow font-bold tracking-tight",
    dark:
      "bg-aviation-black text-aviation-yellow hover:bg-aviation-charcoal focus:ring-aviation-black shadow-subtle border border-aviation-charcoal",
    secondary:
      "bg-aviation-offWhite text-aviation-black hover:bg-aviation-lightGray border border-aviation-border focus:ring-aviation-charcoal",
    outline:
      "bg-white text-aviation-black hover:bg-aviation-offWhite border border-aviation-border focus:ring-aviation-yellow",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost:
      "text-aviation-charcoal hover:bg-aviation-lightGray hover:text-aviation-black",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon && <span className="flex items-center">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="flex items-center transition-transform group-hover:translate-x-0.5">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
