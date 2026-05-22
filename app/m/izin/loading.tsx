export default function Loading() {
  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto pb-24 animate-pulse">
      <div className="pt-2 space-y-1">
        <div className="h-7 w-44 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>
      <div className="h-40 bg-muted rounded-xl" />
      <div className="h-5 w-28 bg-muted rounded" />
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-xl" />
      ))}
    </div>
  );
}
