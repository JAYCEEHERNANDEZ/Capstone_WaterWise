import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Gauge } from "lucide-react";
import Dropdown from "./Dropdown";

const emptyReading = { consumerNo: "", consumerName: "", purok: "", previousReading: "", currentReading: "", readingDate: "", status: "Recorded" };

function initialFormFor(selectedReading) {
  return selectedReading ? {
    consumerNo: selectedReading.consumerNo,
    consumerName: selectedReading.consumerName,
    purok: selectedReading.purok,
    previousReading: selectedReading.previousReading,
    currentReading: selectedReading.currentReading,
    readingDate: selectedReading.readingDate,
    status: selectedReading.status,
  } : emptyReading;
}

function MeterReadingFormFields({ onSave, selectedReading, onCancel }) {
  const formRef = useRef(null);
  const [formData, setFormData] = useState(() => initialFormFor(selectedReading));
  const [errors, setErrors] = useState({});
  const consumption = formData.previousReading !== "" && formData.currentReading !== "" ? Number(formData.currentReading) - Number(formData.previousReading) : 0;
  const hasLowReading = consumption < 0;

  const handleChange = ({ target }) => {
    setFormData((previous) => ({ ...previous, [target.name]: target.value }));
    setErrors((previous) => ({ ...previous, [target.name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.consumerNo.trim()) nextErrors.consumerNo = "Enter the resident account number.";
    if (!formData.consumerName.trim()) nextErrors.consumerName = "Enter the resident name.";
    if (!formData.purok) nextErrors.purok = "Select the resident's purok.";
    if (formData.previousReading === "") nextErrors.previousReading = "Enter the previous meter value.";
    if (formData.currentReading === "") nextErrors.currentReading = "Enter the current meter value.";
    else if (hasLowReading) nextErrors.currentReading = "The current value cannot be below the previous reading.";
    if (!formData.readingDate) nextErrors.readingDate = "Select the reading date.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSave({ ...formData, previousReading: Number(formData.previousReading), currentReading: Number(formData.currentReading), consumption });
    if (!selectedReading) setFormData(emptyReading);
    setErrors({});
  };

  const fieldClass = (name, readOnly = false) => `mt-2 min-h-12 w-full rounded-xl border bg-white px-4 text-navy-900 outline-none transition-colors focus:ring-4 ${errors[name] ? "border-red-600 focus:border-red-600 focus:ring-red-100" : "border-slate-300 focus:border-water-600 focus:ring-water-100"} ${readOnly ? "cursor-not-allowed bg-slate-100" : ""}`;
  const fieldA11y = (name) => ({ "aria-describedby": errors[name] ? `${name}-error` : undefined, "aria-invalid": Boolean(errors[name]) });
  const error = (name) => errors[name] && <p className="mt-1.5 text-sm font-semibold text-red-700" id={`${name}-error`} role="alert">{errors[name]}</p>;
  const labelClass = "text-sm font-bold text-navy-900";

  return (
    <form className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card" onSubmit={handleSubmit} ref={formRef}>
      <header className="border-b border-slate-200 bg-slate-50 p-5 sm:p-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-water-100 text-water-700"><Gauge aria-hidden="true" className="h-5 w-5" /></span><h2 className="mt-4 text-xl font-bold text-navy-900">{selectedReading ? "Edit meter reading" : "Record meter reading"}</h2><p className="mt-1 text-sm text-slate-600">Confirm the account and compare the previous value before saving.</p></header>
      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <div><label className={labelClass} htmlFor="consumerNo">Account number</label><input {...fieldA11y("consumerNo")} className={fieldClass("consumerNo")} id="consumerNo" name="consumerNo" onChange={handleChange} value={formData.consumerNo} />{error("consumerNo")}</div>
        <div><label className={labelClass} htmlFor="consumerName">Resident name</label><input {...fieldA11y("consumerName")} className={fieldClass("consumerName")} id="consumerName" name="consumerName" onChange={handleChange} value={formData.consumerName} />{error("consumerName")}</div>
        <div><label className={labelClass} htmlFor="purok">Purok</label><Dropdown ariaDescribedBy={fieldA11y("purok")["aria-describedby"]} ariaInvalid={fieldA11y("purok")["aria-invalid"]} ariaLabel="Select purok" className="mt-2" id="purok" name="purok" onValueChange={(value) => handleChange({ target: { name: "purok", value } })} options={[1, 2, 3, 4, 5, 6].map((number) => ({ label: `Purok ${number}`, value: `Purok ${number}` }))} placeholder="Select purok" value={formData.purok} />{error("purok")}</div>
        <div><label className={labelClass} htmlFor="readingDate">Reading date</label><input {...fieldA11y("readingDate")} className={fieldClass("readingDate")} id="readingDate" name="readingDate" onChange={handleChange} type="date" value={formData.readingDate} />{error("readingDate")}</div>
        <div><label className={labelClass} htmlFor="previousReading">Previous reading (m³)</label><input {...fieldA11y("previousReading")} className={`${fieldClass("previousReading")} font-mono tabular-nums`} id="previousReading" inputMode="decimal" min="0" name="previousReading" onChange={handleChange} step="0.01" type="number" value={formData.previousReading} />{error("previousReading")}</div>
        <div><label className={labelClass} htmlFor="currentReading">Current reading (m³)</label><input {...fieldA11y("currentReading")} className={`${fieldClass("currentReading")} font-mono tabular-nums`} id="currentReading" inputMode="decimal" min="0" name="currentReading" onChange={handleChange} step="0.01" type="number" value={formData.currentReading} />{error("currentReading")}</div>

        <div className={`rounded-2xl border p-4 sm:col-span-2 ${hasLowReading ? "border-red-200 bg-red-50" : "border-water-200 bg-water-50"}`}>
          <div className="flex items-start gap-3">{hasLowReading ? <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 text-red-700" /> : <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 text-water-700" />}<div><p className={`font-bold ${hasLowReading ? "text-red-800" : "text-navy-900"}`}>Calculated water use</p><p className="mt-1 font-mono text-2xl font-extrabold tabular-nums">{consumption.toLocaleString()} m³</p><p className="mt-1 text-sm text-slate-600">Current reading minus the previous recorded value.</p></div></div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:col-span-2 sm:flex-row sm:justify-end">{selectedReading && <button className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 font-bold text-navy-900 hover:bg-slate-50" onClick={onCancel} type="button">Cancel</button>}<button className="min-h-12 rounded-xl bg-water-600 px-6 font-bold text-white hover:bg-water-700" type="submit">{selectedReading ? "Update reading" : "Record reading"}</button></div>
      </div>
    </form>
  );
}

const MeterReadingForm = (props) => <MeterReadingFormFields key={props.selectedReading?.id ?? "new-reading"} {...props} />;

export default MeterReadingForm;
