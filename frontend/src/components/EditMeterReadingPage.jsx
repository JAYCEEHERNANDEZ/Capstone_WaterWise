import { useParams } from "react-router-dom";

import MeterReadingForm from "../../components/meter-reading/MeterReadingForm";

function EditMeterReadingPage() {
  const { readingId } = useParams();

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          Edit Meter Reading
        </h1>

        <p className="text-sm text-gray-500">
          Update the selected meter reading record.
        </p>
      </header>

      <MeterReadingForm
        readingId={readingId}
        mode="edit"
      />
    </main>
  );
}

export default EditMeterReadingPage;