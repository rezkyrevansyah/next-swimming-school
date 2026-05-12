export default function Loading() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-7 w-36 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="space-y-2">
        <div className="h-10 bg-muted rounded" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}
