import MeterReadingForm from "./MeterReadingForm";

function AddMeterReadingPage() {
  return (
    <main className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-600">Field operations</p>
        <h1 className="mt-2 text-2xl font-extrabold text-navy-900 sm:text-3xl">
          Add meter reading
        </h1>

        <p className="text-sm text-slate-500">
          Record a new meter value for a resident account.
        </p>
      </header>

      <MeterReadingForm onSave={() => {}} />
    </main>
  );
}

export default AddMeterReadingPage;
