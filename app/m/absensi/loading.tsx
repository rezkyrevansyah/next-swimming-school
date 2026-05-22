export default function Loading() {
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-pulse">
      <div className="pt-2">
        <div className="h-7 w-40 bg-muted rounded" />
      </div>
      <div className="h-10 bg-muted rounded-xl" />
      <div className="h-24 bg-muted rounded-xl" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-xl" />
      ))}
    </div>
  );
}
