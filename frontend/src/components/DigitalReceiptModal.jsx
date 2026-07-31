import { useEffect, useRef } from "react";
import { FiDownload, FiPrinter, FiX } from "react-icons/fi";
import { downloadReceiptImage } from "../utils/downloadReceiptImage";

function ReceiptLine({ label, testId, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-slate-100 py-3 text-sm">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="font-mono font-bold text-navy-900" data-testid={testId}>
        {value}
      </span>
    </div>
  );
}

export default function DigitalReceiptModal({ isOpen, receiptData, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previouslyFocused = document.activeElement;
    const closeOnEscape = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    closeButtonRef.current?.focus();
    return () => { document.removeEventListener("keydown", closeOnEscape); previouslyFocused?.focus?.(); };
  }, [isOpen, onClose]);

  if (!isOpen || !receiptData) return null;

  const calculatedDifference = Number(
    (receiptData.currentReading - receiptData.previousReading).toFixed(1),
  );

  const handleDownload = () => {
    downloadReceiptImage({
      filename: `${receiptData.invoiceNumber}-digital-receipt.png`,
      title: "Digital Receipt",
      lines: [
        ["Invoice Number", receiptData.invoiceNumber],
        ["Name", receiptData.name],
        ["Previous Reading", `${receiptData.previousReading} m³`],
        ["Current Reading", `${receiptData.currentReading} m³`],
        ["Consumption Difference", `${calculatedDifference} m³`],
        [
          "Total Amount Payable",
          `₱${receiptData.amountDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        ],
      ],
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/45 sm:items-center sm:px-4 sm:py-6"
      aria-label="Digital receipt"
      aria-modal="true"
      data-testid="receipt-modal-overlay"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-slate-200 bg-white shadow-modal sm:rounded-3xl"
        data-testid="receipt-modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white p-4  sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-water-600">
              Digital receipt
            </p>
            <h3 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-navy-900 sm:text-2xl">
              Billing statement preview
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              className="flex h-11 items-center gap-2 rounded-xl bg-water-50 px-3 text-sm font-bold text-water-600 transition hover:bg-water-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600"
              data-testid="download-receipt-image"
              onClick={handleDownload}
              type="button"
            >
              <FiDownload aria-hidden="true" className="h-4 w-4" />
              Download
            </button>
            <button aria-label="Print receipt" className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" onClick={() => window.print()} type="button"><FiPrinter aria-hidden="true" className="h-4 w-4" /></button>
            <button
              ref={closeButtonRef}
              aria-label="Close receipt"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600"
              data-testid="close-modal-btn"
              onClick={onClose}
              type="button"
            >
              <FiX aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <ReceiptLine
            label="Invoice Number"
            testId="receipt-invoice"
            value={receiptData.invoiceNumber}
          />
          <ReceiptLine label="Name" testId="receipt-name" value={receiptData.name} />
          <ReceiptLine
            label="Previous Meter Dial Reading"
            testId="receipt-prev-dial"
            value={`${receiptData.previousReading} m³`}
          />
          <ReceiptLine
            label="Current Meter Dial Reading"
            testId="receipt-curr-dial"
            value={`${receiptData.currentReading} m³`}
          />
          <ReceiptLine
            label="Total Consumption Difference"
            testId="receipt-diff"
            value={`${calculatedDifference} m³`}
          />

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <strong className="text-sm font-bold text-navy-900">
                Total Amount Payable
              </strong>
              <span
                className="font-mono text-xl font-bold text-red-700"
                data-testid="receipt-total-payable"
              >
                ₱{receiptData.amountDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
