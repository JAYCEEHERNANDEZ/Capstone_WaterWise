import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, FileText, Plus, X } from "lucide-react";
import PaymentForm from "./PaymentForm";

const currency = (value) =>
  `₱${Number(value ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

export default function PaymentModal({
  billingRecords = [],
  error = "",
  initialBilling = null,
  isOpen,
  onClose,
  onRecordAnother,
  onSubmit,
  onViewReceipt,
}) {
  const closeButtonRef = useRef(null);
  const panelRef = useRef(null);
  const successHeadingRef = useRef(null);
  const [completedPayment, setCompletedPayment] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const [useInitialBilling, setUseInitialBilling] = useState(true);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;

      const focusableElements = panelRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (completedPayment) {
      requestAnimationFrame(() => successHeadingRef.current?.focus());
    }
  }, [completedPayment]);

  if (!isOpen) return null;

  const effectiveInitialBilling = useInitialBilling ? initialBilling : null;
  const initialData = effectiveInitialBilling
    ? {
        billingId: effectiveInitialBilling.id,
        consumerName: effectiveInitialBilling.consumerName,
        currentBalance: effectiveInitialBilling.outstandingBalance,
      }
    : null;

  const recordAnother = () => {
    setCompletedPayment(null);
    setUseInitialBilling(false);
    setFormVersion((version) => version + 1);
    onRecordAnother?.();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-navy-950/45 p-3 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <section
        ref={panelRef}
        aria-label="Record resident payment"
        aria-modal="true"
        className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-600">
              Payment administration
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-navy-900 sm:text-2xl">
              {completedPayment ? "Payment recorded" : "Record payment"}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            aria-label="Close payment modal"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {completedPayment ? (
            <div className="flex min-h-full flex-col justify-center p-5 sm:p-8">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 aria-hidden="true" className="h-8 w-8" />
              </span>
              <h3
                className="mt-5 text-2xl font-extrabold tracking-[-0.03em] text-navy-900 outline-none"
                ref={successHeadingRef}
                tabIndex={-1}
              >
                Payment saved successfully
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The transaction is in the payment ledger and the billing balance has been updated.
              </p>

              <dl className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-sm font-semibold text-emerald-800">Transaction</dt>
                  <dd className="font-mono text-sm font-bold text-emerald-950">
                    #{completedPayment.id}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-sm font-semibold text-emerald-800">Resident</dt>
                  <dd className="text-right text-sm font-bold text-emerald-950">
                    {completedPayment.consumerName}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-sm font-semibold text-emerald-800">Amount received</dt>
                  <dd className="font-mono text-lg font-extrabold text-emerald-950">
                    {currency(completedPayment.amountPaid)}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-water-600 px-4 font-bold text-white hover:bg-water-700"
                  onClick={() => onViewReceipt?.(completedPayment)}
                  type="button"
                >
                  <FileText aria-hidden="true" className="h-4 w-4" />
                  View receipt
                </button>
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 font-bold text-navy-900 hover:bg-slate-50"
                  onClick={recordAnother}
                  type="button"
                >
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  Record another
                </button>
              </div>
              <button
                className="mt-3 min-h-11 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
                onClick={onClose}
                type="button"
              >
                Return to payment history
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div
                  className="sticky top-0 z-10 mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-card sm:mx-6"
                  role="alert"
                >
                  {error}
                </div>
              )}
              <PaymentForm
                key={`${effectiveInitialBilling?.id ?? "new"}-${formVersion}`}
                billingRecords={billingRecords}
                initialData={initialData}
                onSubmit={onSubmit}
                onSuccess={setCompletedPayment}
              />
            </>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
