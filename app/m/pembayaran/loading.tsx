export default function Loading() {
  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-muted rounded-md" />
        <div className="h-6 w-28 bg-muted rounded" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-xl" />
      ))}
    </div>
  );
}
