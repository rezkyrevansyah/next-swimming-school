export default function MemberIzinLoading() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="h-7 w-20 bg-muted rounded" />
      <div className="h-32 bg-muted rounded-xl" />
      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}
