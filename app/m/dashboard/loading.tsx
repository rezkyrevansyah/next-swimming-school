export default function Loading() {
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="pt-2 space-y-1 animate-pulse">
        <div className="h-4 w-28 bg-muted rounded" />
        <div className="h-7 w-40 bg-muted rounded" />
      </div>
      <div className="h-16 bg-muted rounded-xl animate-pulse" />
      <div className="h-16 bg-muted rounded-xl animate-pulse" />
      <div className="h-24 bg-muted rounded-xl animate-pulse" />
      <div className="h-32 bg-muted rounded-xl animate-pulse" />
    </div>
  );
}
