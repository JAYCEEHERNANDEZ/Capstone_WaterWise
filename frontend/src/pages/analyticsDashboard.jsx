import AnalyticsTitle from "../components/AnalyticsTitle";
import AdminOverallConsumptionCard from "../components/AdminOverallConsumptionCard";
import AdminMonthlyConsumptionCard from "../components/AdminMonthlyConsumptionCard";
import AdminYearlyConsumptionCard from "../components/AdminYearlyConsumptionCard";
import AdminPerPurokConsumptionCard from "../components/AdminPerPurokConsumptionCard";
import ConsumptionRankingSection from "../components/ConsumptionRankingSection";
import MonthlyConsumptionTrend from "../components/MonthlyConsumptionTrend";
import YearlyConsumptionTrend from "../components/YearlyConsumptionTrend";
import PerPurokConsumptionTrend from "../components/PerPurokConsumptionTrend";
import PurokComparisonChart from "../components/PurokComparisonChart";
import AnomalyRecommendationSection from "../components/AnomalyRecommendationSection";

export default function AnalyticsDashboard() {
  return (
    <main className="space-y-5" data-testid="analytics-dashboard">
      <AnalyticsTitle />

      <section aria-label="Consumption summary" className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AdminOverallConsumptionCard />
          <AdminMonthlyConsumptionCard />
          <AdminYearlyConsumptionCard />
        </div>
        <AdminPerPurokConsumptionCard />
      </section>

      <ConsumptionRankingSection />

      <section aria-label="Consumption trends" className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MonthlyConsumptionTrend />
          <YearlyConsumptionTrend />
        </div>
        <PerPurokConsumptionTrend />
        <PurokComparisonChart />
      </section>

      <AnomalyRecommendationSection />
    </main>
  );
}
