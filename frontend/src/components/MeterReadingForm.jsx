import { useState } from "react";

const initialForm = {
  consumerNo: "",
  consumerName: "",
  purok: "",
  previousReading: "",
  currentReading: "",
  readingDate: "",
  status: "Recorded",
};

function initialFormFor(selectedReading) {
  if (!selectedReading) return initialForm;

  return {
    consumerNo: selectedReading.consumerNo,
    consumerName: selectedReading.consumerName,
    purok: selectedReading.purok,
    previousReading: selectedReading.previousReading,
    currentReading: selectedReading.currentReading,
    readingDate: selectedReading.readingDate,
    status: selectedReading.status,
  };
}

const MeterReadingFormFields = ({
  onSave,
  selectedReading,
  onCancel,
}) => {
  const [formData, setFormData] =
    useState(() => initialFormFor(selectedReading));

  const [errors, setErrors] =
    useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const validationErrors = {};

    if (!formData.consumerNo.trim()) {
      validationErrors.consumerNo =
        "Consumer number is required.";
    }

    if (!formData.consumerName.trim()) {
      validationErrors.consumerName =
        "Consumer name is required.";
    }

    if (!formData.purok) {
      validationErrors.purok =
        "Purok is required.";
    }

    if (formData.previousReading === "") {
      validationErrors.previousReading =
        "Previous reading is required.";
    }

    if (formData.currentReading === "") {
      validationErrors.currentReading =
        "Current reading is required.";
    }

    if (
      formData.previousReading !== "" &&
      formData.currentReading !== "" &&
      Number(formData.currentReading) <
        Number(formData.previousReading)
    ) {
      validationErrors.currentReading =
        "Current reading must be greater than or equal to previous reading.";
    }

    if (!formData.readingDate) {
      validationErrors.readingDate =
        "Reading date is required.";
    }

    setErrors(validationErrors);

    return (
      Object.keys(validationErrors)
        .length === 0
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSave({
      ...formData,
      previousReading: Number(
        formData.previousReading
      ),
      currentReading: Number(
        formData.currentReading
      ),
      consumption:
        Number(formData.currentReading) -
        Number(formData.previousReading),
    });

    if (!selectedReading) {
      setFormData(initialForm);
    }

    setErrors({});
  };

  const consumption =
    formData.previousReading !== "" &&
    formData.currentReading !== ""
      ? Number(formData.currentReading) -
        Number(formData.previousReading)
      : 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md p-6 mb-6"
    >
      <h2 className="text-xl font-bold mb-6">
        {selectedReading
          ? "Edit Meter Reading"
          : "Create Meter Reading"}
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label
            htmlFor="consumerNo"
            className="font-medium block mb-1"
          >
            Consumer Number
          </label>

          <input
            id="consumerNo"
            name="consumerNo"
            type="text"
            value={formData.consumerNo}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          {errors.consumerNo && (
            <p className="text-red-500 text-sm mt-1">
              {errors.consumerNo}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="consumerName"
            className="font-medium block mb-1"
          >
            Consumer Name
          </label>

          <input
            id="consumerName"
            name="consumerName"
            type="text"
            value={formData.consumerName}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          {errors.consumerName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.consumerName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="purok"
            className="font-medium block mb-1"
          >
            Purok
          </label>

          <select
            id="purok"
            name="purok"
            value={formData.purok}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="">
              Select Purok
            </option>
            <option value="Purok 1">
              Purok 1
            </option>
            <option value="Purok 2">
              Purok 2
            </option>
            <option value="Purok 3">
              Purok 3
            </option>
            <option value="Purok 4">
              Purok 4
            </option>
            <option value="Purok 5">
              Purok 5
            </option>
            <option value="Purok 6">
              Purok 6
            </option>
          </select>

          {errors.purok && (
            <p className="text-red-500 text-sm mt-1">
              {errors.purok}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="readingDate"
            className="font-medium block mb-1"
          >
            Reading Date
          </label>

          <input
            id="readingDate"
            name="readingDate"
            type="date"
            value={formData.readingDate}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          {errors.readingDate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.readingDate}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="previousReading"
            className="font-medium block mb-1"
          >
            Previous Reading
          </label>

          <input
            id="previousReading"
            name="previousReading"
            type="number"
            value={formData.previousReading}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          {errors.previousReading && (
            <p className="text-red-500 text-sm mt-1">
              {errors.previousReading}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="currentReading"
            className="font-medium block mb-1"
          >
            Current Reading
          </label>

          <input
            id="currentReading"
            name="currentReading"
            type="number"
            value={formData.currentReading}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          {errors.currentReading && (
            <p className="text-red-500 text-sm mt-1">
              {errors.currentReading}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="consumption"
            className="font-medium block mb-1"
          >
            Consumption
          </label>

          <input
            id="consumption"
            type="number"
            readOnly
            value={consumption}
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="font-medium block mb-1"
          >
            Status
          </label>

          <input
            id="status"
            type="text"
            readOnly
            value={formData.status}
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>

      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {selectedReading
            ? "Update"
            : "Save"}
        </button>

        {selectedReading && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

const MeterReadingForm = (props) => (
  <MeterReadingFormFields
    key={props.selectedReading?.id ?? "new-reading"}
    {...props}
  />
);

export default MeterReadingForm;
