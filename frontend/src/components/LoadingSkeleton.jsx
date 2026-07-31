function SkeletonBlock({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`waterwise-skeleton-shimmer rounded-xl bg-gradient-to-r from-slate-100 via-slate-200/70 to-slate-100 bg-[length:200%_100%] ${className}`}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <SkeletonBlock className="h-10 w-10" />
        <SkeletonBlock className="h-8 w-8" />
      </div>
      <SkeletonBlock className="h-3 w-32" />
      <SkeletonBlock className="h-9 w-28" />
      <SkeletonBlock className="h-3 w-44 max-w-full" />
    </div>
  );
}

function InlineSkeleton() {
  return <div className="space-y-3"><SkeletonBlock className="h-9 w-32" /><SkeletonBlock className="h-3 w-44 max-w-full" /></div>;
}

function ListSkeleton({ count }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }, (_, index) => (
        <div className="rounded-2xl border border-slate-200 bg-white p-4" key={index}>
          <div className="flex items-start gap-3">
            <SkeletonBlock className="h-11 w-11 shrink-0" />
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-4 w-48 max-w-[75%]" />
              <SkeletonBlock className="mt-3 h-3 w-full" />
              <SkeletonBlock className="mt-2 h-3 w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ count }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="hidden grid-cols-5 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 md:grid">
        {Array.from({ length: 5 }, (_, index) => <SkeletonBlock className="h-3 w-20" key={index} />)}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: count }, (_, index) => (
          <div className="grid gap-3 p-4 md:grid-cols-5 md:items-center" key={index}>
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-7 w-20 rounded-full" />
            <SkeletonBlock className="h-11 w-full md:ml-auto md:w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartBodySkeleton() {
  const heights = ["h-[36%]", "h-[58%]", "h-[45%]", "h-[74%]", "h-[62%]", "h-[86%]", "h-[68%]"];
  return (
    <div className="mt-2">
      <div className="flex h-52 items-end gap-3 overflow-hidden sm:h-64">
        {heights.map((height, index) => <SkeletonBlock className={`min-w-6 flex-1 rounded-b-sm rounded-t-xl ${height}`} key={index} />)}
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1"><SkeletonBlock className="h-3 w-24" /><SkeletonBlock className="mt-3 h-6 w-52 max-w-full" /></div>
        <SkeletonBlock className="h-11 w-11 shrink-0" />
      </div>
      <div className="mt-6"><ChartBodySkeleton /></div>
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div className={`rounded-2xl border border-slate-200 p-4 shadow-card sm:p-5 ${index === 0 ? "bg-navy-950" : "bg-white"}`} key={index}>
            <SkeletonBlock className={`h-3 w-24 ${index === 0 ? "opacity-20" : ""}`} />
            <SkeletonBlock className={`mt-7 h-8 w-28 ${index === 0 ? "opacity-20" : ""}`} />
            <SkeletonBlock className={`mt-3 h-3 w-20 ${index === 0 ? "opacity-20" : ""}`} />
          </div>
        ))}
      </div>
      <ChartSkeleton />
    </>
  );
}

function BillingSkeleton() {
  return (
    <>
      <div className="rounded-2xl bg-navy-950 p-5 sm:p-6">
        <SkeletonBlock className="h-3 w-36 opacity-20" />
        <SkeletonBlock className="mt-4 h-11 w-48 opacity-20" />
        <SkeletonBlock className="mt-6 h-16 w-full opacity-20 sm:ml-auto sm:w-60" />
      </div>
      <TableSkeleton count={3} />
    </>
  );
}

function ProfileSkeleton() {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div className={`rounded-2xl p-5 ${index === 1 ? "bg-navy-950" : "border border-slate-200 bg-white"}`} key={index}>
            <SkeletonBlock className={`h-3 w-28 ${index === 1 ? "opacity-20" : ""}`} />
            <SkeletonBlock className={`mt-6 h-8 w-40 ${index === 1 ? "opacity-20" : ""}`} />
            <SkeletonBlock className={`mt-4 h-12 w-full ${index === 1 ? "opacity-20" : ""}`} />
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" key={index}>
            <SkeletonBlock className="h-3 w-24" /><SkeletonBlock className="mt-3 h-7 w-48" />
            <div className="mt-6 grid grid-cols-2 gap-3">{Array.from({ length: 4 }, (_, itemIndex) => <SkeletonBlock className="h-20 w-full" key={itemIndex} />)}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function LoadingSkeleton({ className = "", count = 3, label = "Loading content", variant = "metrics" }) {
  return (
    <div aria-busy="true" aria-live="polite" className={`space-y-5 sm:space-y-6 ${className}`} data-testid={`loading-skeleton-${variant}`} role="status">
      <span className="sr-only">{label}</span>
      {variant === "billing" && <BillingSkeleton />}
      {variant === "card" && <CardSkeleton />}
      {variant === "chart" && <ChartBodySkeleton />}
      {variant === "chart-panel" && <ChartSkeleton />}
      {variant === "inline" && <InlineSkeleton />}
      {variant === "list" && <ListSkeleton count={count} />}
      {variant === "notifications" && <ListSkeleton count={count} />}
      {variant === "profile" && <ProfileSkeleton />}
      {variant === "table" && <TableSkeleton count={count} />}
      {variant === "metrics" && <MetricsSkeleton />}
    </div>
  );
}
