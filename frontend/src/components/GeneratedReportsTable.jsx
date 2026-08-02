import { useCallback, useEffect, useState } from "react";
import { Download, Printer, RefreshCw } from "lucide-react";
import {
  downloadReportPDF,
  fetchGeneratedReports,
} from "../services/reportAPI";
import LoadingSkeleton from "./LoadingSkeleton";
import Table from "./Table";

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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-wider text-water-600">Report archive</p><h2 className="mt-1 text-2xl font-extrabold">Generated Reports</h2></div>
        <button
          className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 font-bold text-navy-900 transition-colors hover:border-water-300 hover:bg-water-50 hover:text-water-700"
          onClick={loadReports}
          type="button"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {loading && <LoadingSkeleton label="Loading generated reports" variant="table" />}
      {error && <p className="mb-3 text-red-500">{error}</p>}
      {!loading && !error && (
        <Table
          ariaLabel="Generated reports"
          className="shadow-none"
          columns={[{ key: "report", label: "Report" }, { key: "type", label: "Type" }, { key: "range", label: "Date range" }, { key: "created", label: "Created" }, { key: "actions", label: "Actions", className: "text-right" }]}
          data={reports}
          emptyDescription="Generated report files will appear in this archive."
          emptyTitle="No reports generated yet"
          getRowKey={(report) => report.id}
          rowClassName="grid grid-cols-2 gap-4 p-4 transition-colors hover:bg-slate-50 md:table-row md:p-0"
          tableClassName="block w-full text-left text-sm md:table md:min-w-[760px]"
          renderRow={(report) => <>
                  <td className="px-3 py-4 font-semibold">
                    {report.title ?? "Generated Report"}
                  </td>
                  <td className="px-3 py-4 capitalize"><span className="rounded-full bg-water-50 px-3 py-1.5 text-xs font-bold text-water-700">{report.type ?? "—"}</span></td>
                  <td className="px-3 py-4">
                    {formatDate(report.start_date)} – {formatDate(report.end_date)}
                  </td>
                  <td className="px-3 py-4">{formatDate(report.created_at)}</td>
                  <td className="px-3 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        aria-label={`Download ${report.title ?? "report"}`}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                        disabled={downloadingId === report.id}
                        onClick={() => downloadReport(report)}
                        type="button"
                      >
                        <Download size={17} />
                      </button>
                      <button
                        aria-label={`Print ${report.title ?? "report"}`}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        onClick={() => window.print()}
                        type="button"
                      >
                        <Printer size={17} />
                      </button>
                    </div>
                  </td>
          </>}
        />
      )}
    </section>
  );
}
