import { useState } from "react";
import MeterReadingForm from "./MeterReadingForm";
import MeterReadingTable from "./MeterReadingTable";
import meterReadingData from "../data/meterReadingData";

const MeterReading = () => {
  const [readings, setReadings] =
    useState(meterReadingData);

  const [selectedReading, setSelectedReading] =
    useState(null);

  const handleSave = (reading) => {
    if (selectedReading) {
      setReadings((prev) =>
        prev.map((item) =>
          item.id === selectedReading.id
            ? {
                ...reading,
                id: selectedReading.id,
              }
            : item
        )
      );

      setSelectedReading(null);
      return;
    }

    const newReading = {
      ...reading,
      id: Date.now(),
    };

    setReadings((prev) => [
      ...prev,
      newReading,
    ]);
  };

  const handleEdit = (reading) => {
    setSelectedReading(reading);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this meter reading?"
    );

    if (!confirmed) return;

    setReadings((prev) =>
      prev.filter(
        (reading) => reading.id !== id
      )
    );

    if (
      selectedReading &&
      selectedReading.id === id
    ) {
      setSelectedReading(null);
    }
  };

  const handleCancel = () => {
    setSelectedReading(null);
  };

  return (
    <section className="space-y-6">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-600">Field operations</p>
          <h1 className="mt-2 text-2xl font-extrabold text-navy-900 sm:text-3xl">
            Meter reading management
          </h1>

          <p className="mt-2 text-slate-600">
            Create, update, and review resident meter readings.
          </p>
        </div>

        <MeterReadingForm
          onSave={handleSave}
          selectedReading={selectedReading}
          onCancel={handleCancel}
        />

        <MeterReadingTable
          readings={readings}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

      </div>
    </section>
  );
};

export default MeterReading;
