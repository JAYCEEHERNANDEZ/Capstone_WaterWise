import MeterReadingTable from "../../components/meter-reading/MeterReadingTable";

function MeterReaderDashboardPage() {
  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          Meter Reader Dashboard
        </h1>

        <p className="text-sm text-gray-500">
          View assigned consumers and recently submitted meter readings.
        </p>
      </header>

      <MeterReadingTable />
    </main>
  );
}

export default MeterReaderDashboardPage;