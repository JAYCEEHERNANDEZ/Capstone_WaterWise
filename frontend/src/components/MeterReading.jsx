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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Meter Reading Management
          </h1>

          <p className="mt-2 text-gray-600">
            Create, update, and manage
            consumer meter reading
            records.
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
    </div>
  );
};

export default MeterReading;