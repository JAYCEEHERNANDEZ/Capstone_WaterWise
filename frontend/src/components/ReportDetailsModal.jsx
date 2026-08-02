import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, FileText, X } from "lucide-react";
import LoadingSkeleton from "./LoadingSkeleton";
import { fetchReportDetails } from "../services/reportAPI";

const metricLabel = (key) => key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
const metricValue = (key, value) => {
  const numericValue = Number(value) || 0;
  if (/amount|balance|billed|collected/i.test(key)) return `₱${numericValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  if (/consumption/i.test(key)) return `${numericValue.toLocaleString("en-US")} m³`;
  return numericValue.toLocaleString("en-US");
};

function recordSummary(record, type) {
  if (type === "billing") return `${record.billingDate} · ${record.consumerName} · ₱${Number(record.totalBill).toLocaleString("en-US", { minimumFractionDigits: 2 })} · ${record.status}`;
  if (type === "residents") return `${record.name} · ${record.username} · ${record.purok} · ${record.status}`;
  return `${record.readingDate} · ${record.consumerName} · ${record.purok} · ${Number(record.consumption).toLocaleString("en-US")} m³`;
}

export default function ReportDetailsModal({ onClose, reportId }) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fetchReportDetails(reportId, { signal: controller.signal })
      .then(setReport)
      .catch((requestError) => {
        if (requestError.code !== "ERR_CANCELED") {
          setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to load report details.");
        }
      });
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      controller.abort();
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, reportId]);

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/60 sm:items-center sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()} role="presentation">
      <section aria-labelledby="report-details-title" aria-modal="true" className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-slate-200 bg-white shadow-modal sm:rounded-3xl" role="dialog">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-700">Saved report</p>
            <h2 className="mt-1 text-xl font-extrabold text-navy-900" id="report-details-title">{report?.title ?? "Report details"}</h2>
          </div>
          <button aria-label="Close report details" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100" onClick={onClose} type="button"><X aria-hidden="true" className="h-5 w-5" /></button>
        </header>

        <div className="p-5 sm:p-6">
          {!report && !error && <LoadingSkeleton label="Loading report details" variant="list" />}
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">{error}</div>}
          {report && (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Period</p><p className="mt-1 font-mono text-sm font-bold tabular-nums text-navy-900">{report.start_date}<br />{report.end_date}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Records</p><p className="mt-1 font-mono text-xl font-extrabold tabular-nums text-navy-900">{report.record_count.toLocaleString()}</p></div>
                <div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs font-semibold text-emerald-700">Status</p><p className="mt-1 inline-flex items-center gap-1.5 font-bold text-emerald-800"><CheckCircle2 aria-hidden="true" className="h-4 w-4" />{report.status}</p></div>
              </div>

              <section>
                <h3 className="font-extrabold text-navy-900">Included summary</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {Object.entries(report.report_data?.summary ?? {}).map(([key, value]) => (
                    <div className="rounded-xl border border-slate-200 p-3" key={key}><p className="text-xs font-semibold text-slate-500">{metricLabel(key)}</p><p className="mt-1 font-mono text-lg font-extrabold tabular-nums text-navy-900">{metricValue(key, value)}</p></div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-extrabold text-navy-900">Record preview</h3>
                <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {(report.report_data?.records ?? []).slice(0, 5).map((record) => (
                    <div className="flex items-start gap-3 p-3 text-sm text-slate-600" key={record.id}><FileText aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-water-700" /><span>{recordSummary(record, report.report_type)}</span></div>
                  ))}
                  {(report.report_data?.records ?? []).length === 0 && <p className="p-4 text-sm text-slate-500">No source records were included.</p>}
                </div>
                {(report.report_data?.records ?? []).length > 5 && <p className="mt-2 text-xs text-slate-500">Showing 5 of {report.record_count.toLocaleString()} records. The PDF contains the complete snapshot.</p>}
              </section>
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
