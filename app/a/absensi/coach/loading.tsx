export default function AbsensiCoachLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4 animate-pulse">
      <div className="h-7 w-36 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="rounded-xl border overflow-hidden">
        <div className="h-10 bg-muted border-b" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted/50 border-b" />
        ))}
      </div>
    </div>
  );
}
