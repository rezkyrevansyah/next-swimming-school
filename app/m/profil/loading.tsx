export default function MemberProfilLoading() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 bg-muted rounded-full" />
        <div className="space-y-2">
          <div className="h-6 w-36 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-12 bg-muted rounded-xl" />
      ))}
    </div>
  );
}
