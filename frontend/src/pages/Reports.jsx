import { useEffect, useState } from "react";
import { FileText, RefreshCw } from "lucide-react";
import ReportGenerator from "../components/ReportGenerator";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { fetchGeneratedReports } from "../services/reportAPI";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchGeneratedReports();
      setReports(response?.data ?? response ?? []);
    } catch {
      setError("We couldn't load the report archive. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(loadReports);
  }, []);

  return (
    <main className="space-y-6">
      <header className="ww-page-header p-5 text-white sm:p-6">
        <p className="ww-eyebrow">Decision support</p>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              <FileText aria-hidden="true" className="h-7 w-7 text-water-300" />
              Reports
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-water-100">Choose a report and period, preview the filters, then generate a reliable record for barangay operations.</p>
          </div>
          <button className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-water-600 px-4 py-2 font-bold text-white transition-colors hover:bg-water-700" onClick={loadReports} type="button">
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Refresh archive
          </button>
        </div>
      </header>

      <ReportGenerator onGenerated={loadReports} />

      <section className="ww-glass-strong rounded-2xl p-5 sm:p-6">
        <p className="ww-eyebrow !text-water-700">Report archive</p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Generated reports</h2>
        <p className="mt-1 text-sm text-slate-500">Previously generated reports and their creation dates.</p>

        {loading && (
          <LoadingSkeleton className="mt-5" label="Loading generated reports" variant="list" />
        )}

        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}

        {!loading && !error && reports.length === 0 && (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-bold text-slate-700">No reports generated yet</p>
            <p className="mt-1 text-sm text-slate-500">Generated reports will appear here with their date and filters.</p>
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="mt-5 grid gap-3">
            {reports.map((report) => (
              <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4" key={report.id}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-water-50 text-water-700"><FileText aria-hidden="true" className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{report.title ?? "Generated report"}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{report.created_at || "Date unavailable"}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
