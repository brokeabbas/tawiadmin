import React from "react";
import { cn } from "../../../lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition " +
      "focus:outline-none focus:ring-4 focus:ring-tawi-leaf/15 disabled:opacity-60 disabled:cursor-not-allowed";

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary: "bg-tawi-leaf text-white hover:brightness-[0.98] active:brightness-95",
      secondary:
        "bg-white text-tawi-dark border border-black/10 hover:bg-tawi-bg active:bg-white",
      ghost: "bg-transparent text-tawi-dark hover:bg-black/5",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className)}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";