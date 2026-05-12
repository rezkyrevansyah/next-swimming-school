export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-7 w-40 bg-muted rounded" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-16 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
