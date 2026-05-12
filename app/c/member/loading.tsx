export default function Loading() {
  return (
    <div className="p-4 space-y-3 max-w-lg mx-auto animate-pulse">
      <div className="h-7 w-28 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-xl" />
      ))}
    </div>
  );
}
