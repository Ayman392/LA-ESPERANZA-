export default function SkeletonCard() {
  return (
    <div className="bg-luxury-card border border-white/[0.06] rounded-sm overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-white/[0.03]" />
      <div className="p-4 space-y-3">
        <div className="h-2 w-16 bg-white/[0.06] rounded" />
        <div className="h-4 w-3/4 bg-white/[0.06] rounded" />
        <div className="h-3 w-1/2 bg-white/[0.06] rounded" />
        <div className="h-4 w-24 bg-white/[0.06] rounded" />
      </div>
    </div>
  );
}
