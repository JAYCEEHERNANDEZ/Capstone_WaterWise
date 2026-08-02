import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiDownload, FiPrinter, FiX } from "react-icons/fi";
import { downloadReceiptImage } from "../utils/downloadReceiptImage";

function RecordRow({ label, testId, value }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-3 pr-4 text-sm font-semibold text-slate-500">{label}</td>
      <td
        className="py-3 text-right font-mono text-sm font-bold text-navy-900"
        data-testid={testId}
      >
        {value}
      </td>
    </tr>
  );
}

export default function MeterReadingRecordModal({ isOpen, onClose, recordData }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", closeOnEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen || !recordData) return null;

  const {
    meterName,
    runDate,
    previousReading,
    presentReading,
    baselineBill,
    arrears30Days = 0,
    arrears60Days = 0,
    arrears90Days = 0,
  } = recordData;

  const cubicMetersUsed = Number((presentReading - previousReading).toFixed(2));
  const totalArrears = arrears30Days + arrears60Days + arrears90Days;
  const finalTotalBill = baselineBill + totalArrears;

  const handleDownload = () => {
    const safeName = String(meterName || "meter-reading").replace(/[^a-z0-9-_]/gi, "-");

    downloadReceiptImage({
      filename: `${safeName}-meter-reading-record.png`,
      title: "Meter Reading Record",
      lines: [
        ["Meter Name", meterName],
        ["Run Date", runDate],
        ["Previous Reading", `${previousReading} m³`],
        ["Present Reading", `${presentReading} m³`],
        ["Cubic Meters Used", `${cubicMetersUsed} m³`],
        ["Baseline Water Bill", `₱${baselineBill.toFixed(2)}`],
        ["Over 30 Days", `₱${arrears30Days.toFixed(2)}`],
        ["Over 60 Days", `₱${arrears60Days.toFixed(2)}`],
        ["Over 90 Days", `₱${arrears90Days.toFixed(2)}`],
        ["Total Bill Sum", `₱${finalTotalBill.toFixed(2)}`],
      ],
    });
  };

  return createPortal(
    <div
      aria-label="Meter reading record"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/45 sm:items-center sm:px-4 sm:py-6"
      data-print-document-overlay
      data-testid="meter-reading-record-modal"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-slate-200 bg-white shadow-modal sm:rounded-3xl"
        data-printable-document
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white p-4 sm:p-5"
          data-document-header
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-water-600">
              Sucol Water System
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-navy-900 sm:text-2xl">
              Sucol Water System Meter Reading Record
            </h2>
          </div>

          <div className="flex gap-2" data-document-actions>
            <button
              aria-label="Download meter reading record"
              className="flex h-11 items-center gap-2 rounded-xl bg-water-50 px-3 text-sm font-bold text-water-600 transition hover:bg-water-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600"
              onClick={handleDownload}
              type="button"
            >
              <FiDownload aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              aria-label="Print meter reading record"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600"
              onClick={() => window.print()}
              type="button"
            >
              <FiPrinter aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              ref={closeButtonRef}
              aria-label="Close meter reading record"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600"
              onClick={onClose}
              type="button"
            >
              <FiX aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl bg-water-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Name
            </p>
            <div className="mt-1 font-bold text-navy-900" data-testid="record-meter-name">
              {meterName}
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Run date
            </p>
            <div
              className="mt-1 font-mono text-sm font-bold text-navy-900"
              data-testid="record-run-date"
            >
              {runDate}
            </div>
          </div>

          <div>
            <table className="w-full border-collapse">
              <tbody>
                <RecordRow label="Previous Reading:" testId="telemetry-prev" value={`${previousReading} m³`} />
                <RecordRow label="Present Reading:" testId="telemetry-pres" value={`${presentReading} m³`} />
                <RecordRow label="Cubic Meters Used:" testId="telemetry-used" value={`${cubicMetersUsed} m³`} />
                <RecordRow label="Baseline Water Bill:" testId="telemetry-baseline" value={`₱${baselineBill.toFixed(2)}`} />
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3" data-testid="arrears-matrix">
            <span className="font-mono text-sm font-bold text-navy-900" data-testid="arrears-30">
              Over 30 Days: ₱{arrears30Days.toFixed(2)}
            </span>
            <span className="font-mono text-sm font-bold text-navy-900" data-testid="arrears-60">
              Over 60 Days: ₱{arrears60Days.toFixed(2)}
            </span>
            <span className="font-mono text-sm font-bold text-navy-900" data-testid="arrears-90">
              Over 90 Days: ₱{arrears90Days.toFixed(2)}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-navy-950 p-4 text-white">
            <strong className="text-sm font-bold text-white">Total Bill Sum:</strong>
            <span className="font-mono text-xl font-bold text-water-200" data-testid="record-final-total">
              ₱{finalTotalBill.toFixed(2)}
            </span>
          </div>

          <p className="mt-4 text-center text-xs font-medium text-slate-400" data-document-footer>
            System-generated meter reading record · Keep this copy for your records
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
