export default function Loading() {
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-pulse">
      <div className="h-7 w-40 bg-muted rounded" />
      <div className="flex gap-2">
        <div className="h-10 flex-1 bg-muted rounded" />
        <div className="h-10 flex-1 bg-muted rounded" />
      </div>
      <div className="h-20 bg-muted rounded-xl" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}
