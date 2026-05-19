export default function CoachKelasLoading() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="h-7 w-24 bg-muted rounded" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}
