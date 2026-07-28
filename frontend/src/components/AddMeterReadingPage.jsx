import MeterReadingForm from "../../components/meter-reading/MeterReadingForm";

function AddMeterReadingPage() {
  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          Add Meter Reading
        </h1>

        <p className="text-sm text-gray-500">
          Submit a new meter reading for a consumer account.
        </p>
      </header>

      <MeterReadingForm />
    </main>
  );
}

export default AddMeterReadingPage;