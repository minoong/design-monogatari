"use client";

import { type ReactNode } from "react";

import { cn } from "./lib/cn";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName: string;
  variant?: "primary" | "secondary";
}

const baseClasses =
  "inline-flex h-12 cursor-pointer appearance-none items-center justify-center rounded-pill border border-transparent px-5 font-sans text-base leading-5 font-medium max-[600px]:h-10 max-[600px]:px-4 max-[600px]:text-sm";

const variantClasses = {
  primary: "gap-2 bg-foreground text-background hover:bg-primary-hover max-[600px]:gap-2",
  secondary:
    "min-w-[180px] border-muted-strong bg-transparent hover:border-transparent hover:bg-secondary-hover max-[600px]:min-w-auto",
} as const;

export const Button = ({ children, className, appName, variant = "secondary" }: ButtonProps) => {
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], className)}
      onClick={() => alert(`Hello from your ${appName} app!`)}
      type="button"
    >
      {children}
    </button>
  );
};
