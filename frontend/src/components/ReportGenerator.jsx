import { useState } from "react";
import { Check, FileDown, LoaderCircle, Printer } from "lucide-react";
import { downloadReportPDF, generateReport } from "../services/reportAPI";
import Dropdown from "./Dropdown";

const reportSections = ["summary", "analytics", "consumption", "billing", "residents"];

export default function ReportGenerator({ onGenerated }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ type: "consumption", startDate: "", endDate: "", sections: ["summary", "analytics"] });

  const updateForm = ({ target }) => setForm((current) => ({ ...current, [target.name]: target.value }));
  const toggleSection = (section) => setForm((current) => ({ ...current, sections: current.sections.includes(section) ? current.sections.filter((item) => item !== section) : [...current.sections, section] }));

  const handleGenerate = async () => {
    if (!form.startDate || !form.endDate) { setError("Select both the start and end dates."); return; }
    if (form.endDate < form.startDate) { setError("The end date must be on or after the start date."); return; }
    try {
      setLoading(true); setError("");
      const response = await generateReport(form);
      setPreview(response);
      onGenerated?.();
    } catch {
      setError("The report could not be generated. Check the selected dates and try again.");
    } finally { setLoading(false); }
  };

  const downloadPDF = async () => {
    try {
      if (!preview?.id) return;
      const file = await downloadReportPDF(preview.id);
      const url = window.URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url; link.download = "generated-report.pdf";
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch { setError("The PDF could not be downloaded. Try again."); }
  };

  const fieldClass = "mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-navy-900 outline-none focus:border-water-600 focus:ring-4 focus:ring-water-100";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
      <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-water-600">Report builder</p><h2 className="mt-1 text-xl font-bold text-navy-900">Generate a report</h2><p className="mt-1 text-sm text-slate-600">Choose the scope, reporting period, and sections to include.</p></div>
      {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert">{error}</div>}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div><label className="text-sm font-bold text-navy-900" htmlFor="report-type">Report type</label><Dropdown ariaLabel="Select report type" className="mt-2" id="report-type" name="type" onValueChange={(value) => updateForm({ target: { name: "type", value } })} options={[{ label: "Consumption", value: "consumption" }, { label: "Billing", value: "billing" }, { label: "Residents", value: "consumer" }, { label: "Analytics", value: "analytics" }]} value={form.type} /></div>
        <div><label className="text-sm font-bold text-navy-900" htmlFor="report-start">Start date</label><input aria-invalid={Boolean(error && !form.startDate)} className={fieldClass} id="report-start" name="startDate" onChange={updateForm} type="date" value={form.startDate} /></div>
        <div><label className="text-sm font-bold text-navy-900" htmlFor="report-end">End date</label><input aria-invalid={Boolean(error && !form.endDate)} className={fieldClass} id="report-end" name="endDate" onChange={updateForm} type="date" value={form.endDate} /></div>
      </div>

      <fieldset className="mt-6"><legend className="text-sm font-bold text-navy-900">Report sections</legend><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{reportSections.map((section) => { const selected = form.sections.includes(section); return <label className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm font-semibold capitalize ${selected ? "border-water-300 bg-water-50 text-water-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`} key={section}><input checked={selected} className="sr-only" onChange={() => toggleSection(section)} type="checkbox" /><span className={`flex h-5 w-5 items-center justify-center rounded-md border ${selected ? "border-water-600 bg-water-600 text-white" : "border-slate-300 bg-white"}`}>{selected && <Check aria-hidden="true" className="h-3.5 w-3.5" />}</span>{section}</label>; })}</div></fieldset>

      <button className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-water-600 px-5 font-bold text-white hover:bg-water-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto" disabled={loading} onClick={handleGenerate} type="button">{loading && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}{loading ? "Generating report…" : "Generate report"}</button>

      {preview && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5"><div className="flex items-start gap-3"><Check aria-hidden="true" className="mt-0.5 h-5 w-5 text-emerald-700" /><div className="min-w-0 flex-1"><p className="font-bold text-emerald-900">Report ready</p><p className="mt-1 text-sm text-emerald-800">{preview.title ?? "Generated report"}</p></div></div><div className="mt-4 flex flex-col gap-2 sm:flex-row"><button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-water-600 px-4 font-bold text-white hover:bg-water-700" onClick={downloadPDF} type="button"><FileDown aria-hidden="true" className="h-4 w-4" />Download PDF</button><button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 font-bold text-navy-900 hover:bg-slate-50" onClick={() => window.print()} type="button"><Printer aria-hidden="true" className="h-4 w-4" />Print</button></div></div>}
    </section>
  );
}
