import { AlertTriangle, CheckCircle2, CircleAlert, Info } from "lucide-react";

const STATUS_CONFIG = {
  NORMAL: {
    Icon: CheckCircle2,
    label: "Normal",
    style: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  LOW: {
    Icon: Info,
    label: "Low risk",
    style: "border-sky-200 bg-sky-50 text-sky-700",
  },
  MEDIUM: {
    Icon: AlertTriangle,
    label: "Review needed",
    style: "border-amber-200 bg-amber-50 text-amber-800",
  },
  HIGH: {
    Icon: AlertTriangle,
    label: "High risk",
    style: "border-red-200 bg-red-50 text-red-700",
  },
  CRITICAL: {
    Icon: CircleAlert,
    label: "Critical review",
    style: "border-red-200 bg-red-50 text-red-700",
  },
};

export default function AnomalyAlertCard({
  area = "Overall",
  message = "No anomaly summary is available.",
  riskScore = 0,
  severity = "NORMAL",
}) {
  const normalizedSeverity = String(severity ?? "NORMAL").toUpperCase();
  const config = STATUS_CONFIG[normalizedSeverity] ?? STATUS_CONFIG.NORMAL;
  const StatusIcon = config.Icon;

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" data-testid="anomaly-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-navy-900">{area}</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${config.style}`}>
          <StatusIcon aria-hidden="true" className="h-3.5 w-3.5" />
          {config.label}
        </span>
      </div>
      <div className="mt-3 border-t border-slate-200 pt-3">
        <p className="text-xs font-semibold text-slate-500">Risk score</p>
        <p className="mt-1 font-mono text-sm font-extrabold tabular-nums text-navy-900">
          {Number(riskScore) || 0}/100
        </p>
      </div>
    </article>
  );
}
