export default function Loading() {
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-pulse">
      <div className="h-7 w-36 bg-muted rounded" />
      <div className="h-20 bg-muted rounded-xl" />
      <div className="h-6 w-28 bg-muted rounded" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}
