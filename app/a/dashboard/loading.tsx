export default function AdminDashboardLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      <div className="space-y-1">
        <div className="h-7 w-28 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>

      {/* Today's classes table */}
      <div className="rounded-xl border overflow-hidden">
        <div className="h-12 bg-muted border-b" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted/50 border-b" />
        ))}
      </div>

      {/* Recent attendance table */}
      <div className="rounded-xl border overflow-hidden">
        <div className="h-12 bg-muted border-b" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-muted/50 border-b" />
        ))}
      </div>
    </div>
  );
}
