import MeterReadingTable from "./MeterReadingTable";

function MeterReadingRecordsPage() {
  return (
    <main className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-600">Field operations</p>
        <h1 className="mt-2 text-2xl font-extrabold text-navy-900 sm:text-3xl">
          Meter reading records
        </h1>

        <p className="text-sm text-slate-500">
          View and manage submitted meter reading records.
        </p>
      </header>

      <MeterReadingTable readings={[]} readOnly />
    </main>
  );
}

export default MeterReadingRecordsPage;
