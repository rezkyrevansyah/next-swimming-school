export default function ApprovalLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4 animate-pulse">
      <div className="h-7 w-28 bg-muted rounded" />
      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}
