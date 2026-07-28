import MeterReadingTable from "../../components/meter-reading/MeterReadingTable";

function MeterReadingRecordsPage() {
  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          Meter Reading Records
        </h1>

        <p className="text-sm text-gray-500">
          View and manage submitted meter reading records.
        </p>
      </header>

      <MeterReadingTable />
    </main>
  );
}

export default MeterReadingRecordsPage;