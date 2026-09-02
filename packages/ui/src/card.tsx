import { type JSX, type ReactNode } from "react";

import { cn } from "./lib/cn";

export function Card({
  className,
  title,
  children,
  href,
}: {
  className?: string;
  title: string;
  children: ReactNode;
  href: string;
}): JSX.Element {
  return (
    <a
      className={cn(
        "group block rounded-lg border border-muted-strong p-6 font-sans transition-colors hover:bg-secondary-hover",
        className,
      )}
      href={`${href}?utm_source=create-turbo&utm_medium=basic&utm_campaign=create-turbo`}
      rel="noopener noreferrer"
      target="_blank"
    >
      <h2 className="mb-2 text-xl font-semibold">
        {title}{" "}
        <span className="inline-block transition-transform group-hover:translate-x-1">-&gt;</span>
      </h2>
      <p className="text-sm leading-6 text-foreground/80">{children}</p>
    </a>
  );
}
