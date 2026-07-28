import { useCallback, useEffect, useState } from "react";
import { Download, Printer, RefreshCw } from "lucide-react";
import {
  downloadReportPDF,
  fetchGeneratedReports,
} from "../services/reportAPI";

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default function GeneratedReportsTable({ refreshKey = 0 }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchGeneratedReports();
      setReports(response?.data ?? response ?? []);
    } catch {
      setError("Failed to load generated reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetchGeneratedReports()
      .then((response) => {
        if (active) {
          setReports(response?.data ?? response ?? []);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("Failed to load generated reports.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const downloadReport = async (report) => {
    try {
      setDownloadingId(report.id);
      setError("");
      const file = await downloadReportPDF(report.id);
      const url = window.URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.title || `report-${report.id}`}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download report.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-wider text-sky-600">Report archive</p><h2 className="mt-1 text-2xl font-extrabold">Generated Reports</h2></div>
        <button
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 font-bold text-white shadow-lg shadow-sky-200 hover:bg-sky-700"
          onClick={loadReports}
          type="button"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {loading && <p>Loading reports...</p>}
      {error && <p className="mb-3 text-red-500">{error}</p>}
      {!loading && !error && reports.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">No reports generated yet.</p>
      )}

      {!loading && reports.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-3">Report</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Date range</th>
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr className="border-b transition last:border-0 hover:bg-sky-50/40" key={report.id}>
                  <td className="px-3 py-4 font-semibold">
                    {report.title ?? "Generated Report"}
                  </td>
                  <td className="px-3 py-4 capitalize"><span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">{report.type ?? "—"}</span></td>
                  <td className="px-3 py-4">
                    {formatDate(report.start_date)} – {formatDate(report.end_date)}
                  </td>
                  <td className="px-3 py-4">{formatDate(report.created_at)}</td>
                  <td className="px-3 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        aria-label={`Download ${report.title ?? "report"}`}
                        className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                        disabled={downloadingId === report.id}
                        onClick={() => downloadReport(report)}
                        type="button"
                      >
                        <Download size={17} />
                      </button>
                      <button
                        aria-label={`Print ${report.title ?? "report"}`}
                        className="rounded-xl bg-slate-100 p-2.5 text-slate-700 hover:bg-slate-200"
                        onClick={() => window.print()}
                        type="button"
                      >
                        <Printer size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
