export default function Loading() {
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-24 animate-pulse">
      <div className="pt-2 space-y-1">
        <div className="h-7 w-32 bg-muted rounded" />
        <div className="h-4 w-56 bg-muted rounded" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 bg-muted rounded-xl" />
      ))}
    </div>
  );
}
