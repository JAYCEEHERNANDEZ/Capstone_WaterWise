function SkeletonBlock({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`waterwise-skeleton-shimmer rounded-2xl bg-gradient-to-r from-slate-100 via-slate-200/70 to-slate-100 bg-[length:200%_100%] ${className}`}
    />
  );
}

function MetricsSkeleton() {
  const chartHeights = ["h-[35%]", "h-[55%]", "h-[42%]", "h-[72%]", "h-[58%]", "h-[86%]", "h-[66%]"];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className={`rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_16px_48px_rgba(15,23,42,0.05)] sm:p-5 ${index === 0 ? "bg-slate-900" : ""}`}
            key={index}
          >
            <SkeletonBlock className={`h-3 w-24 ${index === 0 ? "opacity-20" : ""}`} />
            <SkeletonBlock className={`mt-7 h-8 w-28 ${index === 0 ? "opacity-20" : ""}`} />
            <SkeletonBlock className={`mt-3 h-3 w-20 ${index === 0 ? "opacity-20" : ""}`} />
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-slate-200/70 bg-white p-4 shadow-[0_18px_56px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="mt-3 h-6 w-48" />
          </div>
          <SkeletonBlock className="h-11 w-24" />
        </div>
        <div className="mt-8 flex h-48 items-end gap-3 overflow-hidden sm:h-64">
          {chartHeights.map((height, index) => (
            <SkeletonBlock
              className={`min-w-8 flex-1 rounded-b-sm rounded-t-xl ${height}`}
              key={index}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function BillingSkeleton() {
  return (
    <>
      <div className="rounded-3xl bg-slate-900 p-5 sm:p-7">
        <SkeletonBlock className="h-3 w-36 opacity-20" />
        <SkeletonBlock className="mt-4 h-11 w-48 opacity-20" />
        <SkeletonBlock className="mt-6 h-16 w-full opacity-20 sm:ml-auto sm:w-60" />
      </div>
      <div className="rounded-3xl border border-slate-200/70 bg-white p-4 sm:p-6">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="mt-3 h-7 w-44" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonBlock className="h-28 w-full" key={index} />
          ))}
        </div>
      </div>
    </>
  );
}

function ProfileSkeleton() {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div className={`rounded-2xl p-5 ${index === 1 ? "bg-slate-900" : "border border-slate-200/70 bg-white"}`} key={index}>
            <SkeletonBlock className={`h-3 w-28 ${index === 1 ? "opacity-20" : ""}`} />
            <SkeletonBlock className={`mt-6 h-8 w-40 ${index === 1 ? "opacity-20" : ""}`} />
            <SkeletonBlock className={`mt-4 h-12 w-full ${index === 1 ? "opacity-20" : ""}`} />
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div className="rounded-3xl border border-slate-200/70 bg-white p-5 sm:p-6" key={index}>
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-3 h-7 w-48" />
            <div className="mt-6 grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }, (_, itemIndex) => (
                <SkeletonBlock className="h-20 w-full" key={itemIndex} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function LoadingSkeleton({ label = "Loading content", variant = "metrics" }) {
  return (
    <div
      aria-live="polite"
      className="space-y-5 sm:space-y-6"
      data-testid={`loading-skeleton-${variant}`}
      role="status"
    >
      <span className="sr-only">{label}</span>
      {variant === "billing" && <BillingSkeleton />}
      {variant === "profile" && <ProfileSkeleton />}
      {variant === "metrics" && <MetricsSkeleton />}
    </div>
  );
}
