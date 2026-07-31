import { useState } from "react";

import BillingSummaryCard from "./BillingSummaryCard";
import BillingHistoryTable from "./BillingHistoryTable";
import PaymentForm from "./PaymentForm";

import { billingRecords } from "../data/billingData";

function BillingManagement() {
  const [billingHistory, setBillingHistory] =
    useState(billingRecords);

  const [selectedReceipt, setSelectedReceipt] =
    useState(null);

  const handleSelectReceipt = (receipt) => {
    setSelectedReceipt(receipt);
  };

  const handlePaymentSubmit = (payment) => {
    const updatedHistory = billingHistory.map(
      (record) => {
        if (
          record.consumerName !==
          payment.consumerName
        ) {
          return record;
        }

        return {
          ...record,
          amountDue:
            payment.remainingBalance,
          outstandingBalance:
            payment.remainingBalance,
          status:
            payment.paymentStatus,
        };
      }
    );

    setBillingHistory(updatedHistory);

    if (
      selectedReceipt &&
      selectedReceipt.consumerName ===
        payment.consumerName
    ) {
      const updatedReceipt =
        updatedHistory.find(
          (record) =>
            record.consumerName ===
            payment.consumerName
        );

      setSelectedReceipt(updatedReceipt);
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-600">Financial operations</p>
        <h1 className="mt-2 text-2xl font-extrabold text-navy-900 sm:text-3xl">Billing management</h1>
        <p className="mt-2 max-w-2xl text-slate-600">Review resident bills, record payments, and confirm account balances.</p>
      </header>

          <BillingSummaryCard
            billingData={billingHistory}
          />

          <BillingHistoryTable
            historyData={billingHistory}
            onSelectReceipt={
              handleSelectReceipt
            }
          />

          <PaymentForm
            onSubmit={
              handlePaymentSubmit
            }
          />

          {selectedReceipt && (
            <section
              data-testid="receipt-details"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <h2 className="text-xl font-bold mb-4">
                Receipt Details
              </h2>

              <div className="space-y-2">
                <p
                  data-testid="receipt-invoice"
                >
                  <strong>
                    Invoice Number:
                  </strong>{" "}
                  {
                    selectedReceipt.invoiceNumber
                  }
                </p>

                <p
                  data-testid="receipt-period"
                >
                  <strong>
                    Billing Period:
                  </strong>{" "}
                  {
                    selectedReceipt.billingPeriod
                  }
                </p>

                <p
                  data-testid="receipt-reading-date"
                >
                  <strong>
                    Reading Date:
                  </strong>{" "}
                  {
                    selectedReceipt.readingDate
                  }
                </p>

                <p
                  data-testid="receipt-consumption"
                >
                  <strong>
                    Consumption:
                  </strong>{" "}
                  {
                    selectedReceipt.cubicMetersConsumed
                  }{" "}
                  m³
                </p>

                <p
                  data-testid="receipt-amount"
                >
                  <strong>
                    Amount Due:
                  </strong>{" "}
                  ₱
                  {selectedReceipt.amountDue.toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>

                <p
                  data-testid="receipt-status"
                >
                  <strong>
                    Status:
                  </strong>{" "}
                  {
                    selectedReceipt.status
                  }
                </p>

                <p>
                  <strong>
                    Address:
                  </strong>{" "}
                  {
                    selectedReceipt.address
                  }
                </p>

                <p>
                  <strong>
                    Previous Reading:
                  </strong>{" "}
                  {
                    selectedReceipt.previousReading
                  }
                </p>

                <p>
                  <strong>
                    Current Reading:
                  </strong>{" "}
                  {
                    selectedReceipt.currentReading
                  }
                </p>
              </div>
            </section>
          )}
    </section>
  );
}

export default BillingManagement;
