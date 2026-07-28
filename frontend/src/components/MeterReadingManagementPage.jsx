import MeterReadingForm from "../../components/meter-reading/MeterReadingForm";
import MeterReadingTable from "../../components/meter-reading/MeterReadingTable";

function MeterReadingManagementPage() {
  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          Meter Reading Management
        </h1>

        <p className="text-sm text-gray-500">
          Record and manage consumer meter readings.
        </p>
      </header>

      <MeterReadingForm />

      <MeterReadingTable />
    </main>
  );
}

export default MeterReadingManagementPage; 