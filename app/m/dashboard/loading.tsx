export default function MemberDashboardLoading() {
  return (
    <div className="p-4 space-y-5 animate-pulse">
      {/* Greeting */}
      <div className="space-y-1.5">
        <div className="h-3.5 w-20 bg-muted rounded" />
        <div className="h-7 w-48 bg-muted rounded" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>

      {/* Invoice list */}
      <div className="rounded-xl border overflow-hidden">
        <div className="h-12 bg-muted border-b" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 bg-muted/50 border-b" />
        ))}
      </div>

      {/* Attendance list */}
      <div className="rounded-xl border overflow-hidden">
        <div className="h-12 bg-muted border-b" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted/50 border-b" />
        ))}
      </div>
    </div>
  );
}
