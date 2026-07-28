import ConsumerInfoGrid from "./ConsumerInfoGrid";

import CurrentBillingCard from "./CurrentBillingCard";
import CurrentBalanceCard from "./CurrentBalanceCard";
import BillingHistoryTable from "./BillingHistoryTable";

function ConsumerBillingPage() {
  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          Consumer Billing
        </h1>

        <p className="text-sm text-gray-500">
          View the consumer's current bill, balance, and billing history.
        </p>
      </header>

      <ConsumerInfoGrid />

      <section className="grid gap-4 md:grid-cols-2">
        <CurrentBillingCard />
        <CurrentBalanceCard />
      </section>

      <BillingHistoryTable />
    </main>
  );
}

export default ConsumerBillingPage;
