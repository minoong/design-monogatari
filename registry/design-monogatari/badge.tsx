import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "secondary";
}

const baseClasses =
  "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 font-sans text-xs font-semibold";

const variantClasses = {
  default: "bg-foreground text-background",
  secondary: "border-muted-strong bg-muted text-foreground",
} as const;

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return <span className={cn(baseClasses, variantClasses[variant], className)}>{children}</span>;
}
