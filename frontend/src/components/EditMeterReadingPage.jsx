import { useParams } from "react-router-dom";

import MeterReadingForm from "./MeterReadingForm";

function EditMeterReadingPage() {
  const { readingId } = useParams();

  return (
    <main className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-600">Field operations</p>
        <h1 className="mt-2 text-2xl font-extrabold text-navy-900 sm:text-3xl">
          Edit meter reading
        </h1>

        <p className="text-sm text-slate-500">
          Update the selected meter reading record.
        </p>
      </header>

      <MeterReadingForm
        onSave={() => {}}
        selectedReading={{ id: readingId, consumerNo: "", consumerName: "", purok: "", previousReading: "", currentReading: "", readingDate: "", status: "Recorded" }}
      />
    </main>
  );
}

export default EditMeterReadingPage;
