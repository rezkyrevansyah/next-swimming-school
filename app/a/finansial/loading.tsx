export default function FinansialLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-28 bg-muted rounded" />
        <div className="h-9 w-32 bg-muted rounded" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </div>

      {/* Filter bar */}
      <div className="h-10 bg-muted rounded" />

      {/* Invoice list */}
      <div className="rounded-xl border overflow-hidden">
        <div className="h-10 bg-muted border-b" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 bg-muted/50 border-b" />
        ))}
      </div>
      <div className="h-8 w-48 bg-muted rounded mx-auto" />
    </div>
  );
}
