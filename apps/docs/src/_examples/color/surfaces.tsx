const SURFACES = [
  { className: 'bg-background text-foreground border border-border', label: 'background' },
  { className: 'bg-muted text-foreground', label: 'muted' },
  { className: 'bg-card text-foreground border border-border', label: 'card' },
  { className: 'bg-primary text-primary-foreground', label: 'primary' },
  { className: 'bg-destructive text-destructive-foreground', label: 'destructive' },
];

export default function ColorSurfaces() {
  return (
    <>
      {SURFACES.map((surface) => (
        <div
          key={surface.label}
          className={`flex h-20 w-32 items-center justify-center rounded-md text-sm ${surface.className}`}
        >
          {surface.label}
        </div>
      ))}
    </>
  );
}
