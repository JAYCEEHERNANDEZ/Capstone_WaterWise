const STATUS_STYLES = {
  NORMAL: "border-emerald-200 bg-emerald-50 text-emerald-700",
  LOW: "border-water-200 bg-water-50 text-water-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  CRITICAL: "border-red-200 bg-red-50 text-red-700",
};

export default function AnomalyAlertCard({
  area = "Overall",
  message = "No anomaly detected.",
  riskScore = 0,
  severity = "NORMAL",
}) {
  const normalizedSeverity = String(severity).toUpperCase();
  const statusStyle =
    STATUS_STYLES[normalizedSeverity] ?? STATUS_STYLES.NORMAL;

  return (
    <article
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      data-testid="anomaly-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-bold text-slate-900">{area}</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${statusStyle}`}
        >
          {normalizedSeverity} · {Number(riskScore) || 0}/100
        </span>
      </div>

    </article>
  );
}
