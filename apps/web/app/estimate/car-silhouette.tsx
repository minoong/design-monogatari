export function CarSilhouette({ fill, stroke }: { fill: string; stroke: boolean }) {
  return (
    <svg
      viewBox="0 0 860 320"
      className="h-auto w-full max-w-3xl will-change-transform"
      role="img"
      aria-label="Kite Coupe"
    >
      <g fill="none" fillRule="evenodd">
        <ellipse cx="220" cy="262" rx="78" ry="10" className="fill-foreground/10" />
        <ellipse cx="640" cy="262" rx="78" ry="10" className="fill-foreground/10" />
        <path
          d="M118 214c18-46 62-92 148-118 54-16 132-28 214-28 78 0 148 10 214 38 38 16 86 48 108 78 8 12 14 28 12 42H118z"
          className="fill-muted-foreground/25"
        />
        <path
          d="M86 214c8-54 48-108 138-136 72-22 168-32 262-32 92 0 176 14 248 48 46 22 96 58 114 96 6 12 8 22 6 32-22 8-48 12-86 12H158c-28 0-54-4-72-20Z"
          style={{ fill }}
          stroke={stroke ? 'currentColor' : 'none'}
          strokeWidth={stroke ? 1.5 : 0}
          className="text-border"
        />
        <path
          d="M250 86c48-18 118-28 188-28 64 0 132 8 186 28 12 22 18 48 20 78H238c4-28 8-52 12-78Z"
          className="fill-background/35"
        />
        <path d="M430 86v78M238 164h356" className="stroke-foreground/20" strokeWidth="1" />
        <circle cx="220" cy="236" r="42" className="fill-foreground" />
        <circle cx="220" cy="236" r="24" className="fill-muted" />
        <circle cx="640" cy="236" r="42" className="fill-foreground" />
        <circle cx="640" cy="236" r="24" className="fill-muted" />
        <path d="M158 214h72M618 214h86" className="stroke-foreground/30" strokeWidth="6" />
        <path
          d="M788 198c18 6 28 16 32 28-14 4-32 6-48 6"
          style={{ fill }}
          className="opacity-90"
        />
      </g>
    </svg>
  );
}
