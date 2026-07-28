import { useEffect, useState } from "react";

import { FileText, RefreshCw } from "lucide-react";

import ReportGenerator from "../components/ReportGenerator";

import { fetchGeneratedReports } from "../services/reportAPI";

function Reports() {
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
      setError("Failed to load generated reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(loadReports);
  }, []);

  return (
    <div
      className="
p-6
space-y-6
"
    >
      <div
        className="
flex
justify-between
items-center
"
      >
        <div>
          <h1
            className="
text-2xl
font-bold
flex
items-center
gap-2
"
          >
            <FileText />
            Report Generation
          </h1>

          <p
            className="
text-gray-500
"
          >
            Generate and manage system reports
          </p>
        </div>

        <button
          onClick={loadReports}
          className="
flex
items-center
gap-2
px-4
py-2
rounded-lg
bg-blue-600
text-white
"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <ReportGenerator onGenerated={loadReports} />

      <div
        className="
bg-white
rounded-xl
shadow
p-5
"
      >
        <h2
          className="
font-semibold
text-lg
mb-4
"
        >
          Generated Reports
        </h2>

        {loading && <p>Loading reports...</p>}

        {error && (
          <p
            className="
text-red-500
"
          >
            {error}
          </p>
        )}

        {!loading && !error && reports.length === 0 && (
          <p>No reports generated yet.</p>
        )}

        {!loading && !error && reports.length > 0 && (
          <div
            className="
space-y-3
"
          >
            {reports.map((report) => (
              <div
                key={report.id}
                className="
border
rounded-lg
p-4
"
              >
                <p
                  className="
font-semibold
"
                >
                  {report.title ?? "Generated Report"}
                </p>

                <p
                  className="
text-sm
text-gray-500
"
                >
                  {report.created_at}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
