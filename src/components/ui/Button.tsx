import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "neutral" | "subtle";
  size?: "medium" | "small";
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "medium",
  iconStart,
  iconEnd,
  children,
  disabled = false,
  className,
  onClick,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-sans leading-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary cursor-pointer hover:cursor-pointer";

  const variants = {
    primary:
      "bg-brand-primary text-white border border-brand-primary hover:bg-brand-secondary hover:border-brand-secondary disabled:opacity-40 disabled:pointer-events-none",
    neutral:
      "bg-transparent text-brand-primary border border-brand-primary hover:text-brand-secondary hover:border-brand-secondary disabled:opacity-40 disabled:pointer-events-none",
    subtle:
      "bg-transparent text-brand-primary border-none hover:text-brand-secondary disabled:opacity-40 disabled:pointer-events-none",
  };

  const sizes = {
    medium:
      size === "medium" && variant === "subtle"
        ? "h-10 px-3 py-1.5 text-base"
        : "h-10 px-4 py-2.5 text-base",
    small: "h-8 p-2 text-xs",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], disabled && "cursor-not-allowed", className)}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {iconStart && <span className="shrink-0">{iconStart}</span>}
      <span className="shrink-0">{children}</span>
      {iconEnd && <span className="shrink-0">{iconEnd}</span>}
    </button>
  );
}
