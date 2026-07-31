import AdminOverallConsumptionCard from "../components/AdminOverallConsumptionCard";
import HistoricalConsumptionSummary from "../components/HistoricalConsumptionSummary";
import HistoricalConsumptionGraphs from "../components/HistoricalConsumptionGraphs";
import PurokHistoricalConsumptionGraphs from "../components/PurokHistoricalConsumptionGraphs";

export default function AdminDashboardPage() {
  return (
    <main className="space-y-5" data-testid="admin-dashboard">
      <header className="ww-page-header p-5 text-white">
        <div className="max-w-3xl">
          <p className="ww-eyebrow">Operations overview</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Water operations overview
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-water-100">
            Review recorded consumption using historical water data.
          </p>
        </div>
      </header>

      <section aria-labelledby="dashboard-summary" className="space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-water-600">Live indicators</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900" id="dashboard-summary">Consumption summary</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AdminOverallConsumptionCard />
          <HistoricalConsumptionSummary className="contents" compact />
        </div>
      </section>

      <section aria-labelledby="dashboard-trends" className="space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-water-600">Consumption graphs</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900" id="dashboard-trends">Monthly and yearly trends</h2>
          <p className="mt-1 text-sm text-slate-500">Review recorded monthly and yearly water consumption.</p>
        </div>
        <HistoricalConsumptionGraphs />
      </section>

      <PurokHistoricalConsumptionGraphs />

    </main>
  );
}
