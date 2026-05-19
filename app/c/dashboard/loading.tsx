export default function CoachDashboardLoading() {
  return (
    <div className="p-4 space-y-5 animate-pulse">
      {/* Greeting */}
      <div className="space-y-1.5">
        <div className="h-3.5 w-20 bg-muted rounded" />
        <div className="h-7 w-48 bg-muted rounded" />
      </div>

      {/* Quick action buttons */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </div>

      {/* Schedule table */}
      <div className="rounded-xl border overflow-hidden">
        <div className="h-12 bg-muted border-b" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-muted/50 border-b" />
        ))}
      </div>
    </div>
  );
}
