import { useState } from "react";

import { FileDown, Printer, LoaderCircle } from "lucide-react";

import { generateReport, downloadReportPDF } from "../services/reportAPI";

function ReportGenerator({ onGenerated }) {
  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState(null);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    type: "consumption",

    startDate: "",

    endDate: "",

    sections: ["summary", "analytics"],
  });

  const updateForm = (event) => {
    setForm({
      ...form,

      [event.target.name]: event.target.value,
    });
  };

  const toggleSection = (section) => {
    setForm({
      ...form,

      sections: form.sections.includes(section)
        ? form.sections.filter((item) => item !== section)
        : [...form.sections, section],
    });
  };

  const handleGenerate = async () => {
    try {
      setError("");

      if (!form.startDate || !form.endDate) {
        setError("Please select report date range.");

        return;
      }

      setLoading(true);

      const response = await generateReport(form);

      setPreview(response);

      if (onGenerated) {
        onGenerated();
      }
    } catch {
      setError("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      if (!preview?.id) return;

      const file = await downloadReportPDF(preview.id);

      const url = window.URL.createObjectURL(file);

      const link = document.createElement("a");

      link.href = url;

      link.download = "generated-report.pdf";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download PDF.");
    }
  };

  return (
    <div
      className="
bg-white
rounded-xl
shadow
p-6
space-y-6
"
    >
      <h2
        className="
text-lg
font-semibold
"
      >
        Generate Report
      </h2>

      {error && (
        <p
          className="
text-red-500
"
        >
          {error}
        </p>
      )}

      <div
        className="
grid
grid-cols-1
md:grid-cols-3
gap-4
"
      >
        <select
          name="type"
          value={form.type}
          onChange={updateForm}
          className="
border
rounded-lg
p-2
"
        >
          <option value="consumption">Consumption Report</option>

          <option value="billing">Billing Report</option>

          <option value="consumer">Consumer Report</option>

          <option value="analytics">Analytics Report</option>
        </select>

        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={updateForm}
          className="
border
rounded-lg
p-2
"
        />

        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={updateForm}
          className="
border
rounded-lg
p-2
"
        />
      </div>

      <div>
        <p
          className="
font-medium
mb-2
"
        >
          Report Sections
        </p>

        <div
          className="
flex
gap-4
flex-wrap
"
        >
          {["summary", "analytics", "consumption", "billing", "consumer"].map(
            (section) => (
              <label
                key={section}
                className="
flex
items-center
gap-2
"
              >
                <input
                  type="checkbox"
                  checked={form.sections.includes(section)}
                  onChange={() => toggleSection(section)}
                />

                {section}
              </label>
            ),
          )}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="
bg-blue-600
text-white
px-5
py-2
rounded-lg
flex
items-center
gap-2
"
      >
        {loading ? (
          <LoaderCircle
            className="
animate-spin
"
          />
        ) : (
          "Generate Report"
        )}
      </button>

      {preview && (
        <div
          className="
border
rounded-lg
p-5
space-y-4
"
        >
          <h3
            className="
font-semibold
"
          >
            Report Preview
          </h3>

          <p>{preview.title ?? "Generated Report"}</p>

          <div
            className="
flex
gap-3
"
          >
            <button
              onClick={downloadPDF}
              className="
bg-green-600
text-white
px-4
py-2
rounded-lg
flex
items-center
gap-2
"
            >
              <FileDown size={18} />
              Download PDF
            </button>

            <button
              onClick={() => window.print()}
              className="
bg-gray-700
text-white
px-4
py-2
rounded-lg
flex
items-center
gap-2
"
            >
              <Printer size={18} />
              Print
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportGenerator;
