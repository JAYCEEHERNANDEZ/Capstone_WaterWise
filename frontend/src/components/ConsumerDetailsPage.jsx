import ConsumerInfoGrid from "./ConsumerInfoGrid";

import BillingSummaryCard from "./BillingSummaryCard";
import CurrentBillingCard from "./CurrentBillingCard";
import CurrentBalanceCard from "./CurrentBalanceCard";
import BillingHistoryTable from "./BillingHistoryTable";
import PaymentForm from "./PaymentForm";

function ConsumerDetailsPage() {
  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          Consumer Details
        </h1>

        <p className="text-sm text-gray-500">
          View consumer information, billing records, and payments.
        </p>
      </header>

      <ConsumerInfoGrid />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BillingSummaryCard />
        <CurrentBillingCard />
        <CurrentBalanceCard />
      </section>

      <PaymentForm />

      <BillingHistoryTable />
    </main>
  );
}

export default ConsumerDetailsPage;
