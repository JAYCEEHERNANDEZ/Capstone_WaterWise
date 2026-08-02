import { FiDownload, FiPrinter } from "react-icons/fi";
import { downloadReceiptImage } from "../utils/downloadReceiptImage";
import Modal from "./Modal";
import { useToast } from "./Toast";

function ReceiptRow({ label, testId, value }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-3 pr-4 text-sm font-semibold text-slate-500">{label}</td>
      <td className="py-3 text-right font-mono text-sm font-bold text-navy-900" data-testid={testId}>
        {value}
      </td>
    </tr>
  );
}

export default function OfficialReceiptModal({ isOpen, receiptData, onClose }) {
  const toast = useToast();
  if (!isOpen || !receiptData) return null;

  const {
    meterName,
    runDate,
    previousReading,
    presentReading,
    baselineBill,
    arrears30Days = 0,
    arrears60Days = 0,
    arrears90Days = 0,
  } = receiptData;

  const cubicMetersUsed = Number((presentReading - previousReading).toFixed(2));
  const totalArrears = arrears30Days + arrears60Days + arrears90Days;
  const finalTotalBill = baselineBill + totalArrears;

  const handleDownload = () => {
    downloadReceiptImage({
      filename: `${meterName}-official-receipt.png`,
      title: "Official Receipt",
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
    toast.success("Receipt downloaded", `${meterName}-official-receipt.png was saved.`);
  };

  const handlePrint = () => {
    window.print();
    toast.info("Print dialog opened", "Choose a printer or save the receipt as a PDF.");
  };

  return (
    <Modal
      closeButtonProps={{ "data-testid": "close-modal" }}
      closeLabel="Close official receipt"
      eyebrow="Sucol Water System"
      headerActions={
        <>
            <button
              className="flex h-11 items-center gap-2 rounded-xl bg-water-50 px-3 text-sm font-bold text-water-600 transition hover:bg-water-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600"
              data-testid="download-official-receipt-image"
              onClick={handleDownload}
              type="button"
            >
              <FiDownload aria-hidden="true" className="h-4 w-4" />
              Download
            </button>
            <button aria-label="Print official receipt" className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" onClick={handlePrint} type="button"><FiPrinter aria-hidden="true" className="h-4 w-4" /></button>
        </>
      }
      headerActionsProps={{ "data-document-actions": true }}
      headerProps={{ "data-document-header": true }}
      isOpen={isOpen}
      onClose={onClose}
      overlayProps={{ "data-print-document-overlay": true, "data-testid": "receipt-modal" }}
      panelProps={{ "data-printable-document": true }}
      title="Official receipt"
    >
      <>
        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl bg-water-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Name
            </p>
            <div className="mt-1 font-bold text-navy-900" data-testid="receipt-meter-name">
              {meterName}
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Run date
            </p>
            <div className="mt-1 font-mono text-sm font-bold text-navy-900" data-testid="receipt-run-date">
              {runDate}
            </div>
          </div>

          <div>
            <table className="w-full border-collapse">
              <tbody>
                <ReceiptRow label="Previous Reading:" testId="telemetry-prev" value={`${previousReading} m³`} />
                <ReceiptRow label="Present Reading:" testId="telemetry-pres" value={`${presentReading} m³`} />
                <ReceiptRow label="Cubic Meters Used:" testId="telemetry-used" value={`${cubicMetersUsed} m³`} />
                <ReceiptRow label="Baseline Water Bill:" testId="telemetry-baseline" value={`₱${baselineBill.toFixed(2)}`} />
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
            <span className="font-mono text-xl font-bold text-water-200" data-testid="receipt-final-total">
              ₱{finalTotalBill.toFixed(2)}
            </span>
          </div>
          <p className="mt-4 text-center text-xs font-medium text-slate-400" data-document-footer>
            System-generated receipt · Keep this copy for your records
          </p>
        </div>
      </>
    </Modal>
  );
}
