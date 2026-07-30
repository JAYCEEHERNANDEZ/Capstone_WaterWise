import {
  getMeterReadings,
  getMeterReadingById,
  createMeterReading,
  updateMeterReading,
  deleteMeterReading,
} from "../models/meterReadingModels.js";

import validateMeterReading from "../validation/meterReading.validation.js";

export const WATER_RATE_PER_CUBIC_METER = 17;

function createValidationError(errors) {
  const error = new Error("Validation failed.");
  error.status = 400;
  error.errors = errors;

  return error;
}

export async function fetchMeterReadings() {
  return await getMeterReadings();
}

export async function fetchMeterReadingById(id) {
  const reading = await getMeterReadingById(id);

  if (!reading) {
    throw new Error("Meter reading not found.");
  }

  return reading;
}

export async function addMeterReading(data) {
  const validation = validateMeterReading(data);

  if (!validation.isValid) {
    throw createValidationError(
      validation.errors
    );
  }

  const previousReading = Number(
    data.previousReading
  );

  const currentReading = Number(
    data.currentReading
  );

  const consumption =
    currentReading - previousReading;

  const newReading = {
    consumerId: Number(data.consumerId),

    consumerNo:
      data.consumerNo,

    consumerName:
      data.consumerName,

    purok:
      data.purok,

    previousReading,

    currentReading,

    consumption,

    billAmount:
      consumption *
      WATER_RATE_PER_CUBIC_METER,

    readingDate:
      data.readingDate,

    status:
      data.status || "Recorded",
  };

  return await createMeterReading(
    newReading
  );
}

export async function editMeterReading(
  id,
  data
) {
  const existing =
    await getMeterReadingById(id);

  if (!existing) {
    throw new Error(
      "Meter reading not found."
    );
  }

  const mergedData = {
    ...existing,
    ...data,

    consumerId:
      data.consumerId ??
      existing.consumerId,

    previousReading:
      data.previousReading ??
      existing.previousReading,

    currentReading:
      data.currentReading ??
      existing.currentReading,

    readingDate:
      data.readingDate ??
      existing.readingDate,

    status:
      data.status ??
      existing.status ??
      "Recorded",
  };

  const validation =
    validateMeterReading(mergedData);

  if (!validation.isValid) {
    throw createValidationError(
      validation.errors
    );
  }

  const previousReading = Number(
    mergedData.previousReading
  );

  const currentReading = Number(
    mergedData.currentReading
  );

  const consumption =
    currentReading - previousReading;

  const updatedReading = {
    consumerId: Number(
      mergedData.consumerId
    ),

    consumerNo:
      mergedData.consumerNo,

    consumerName:
      mergedData.consumerName,

    purok:
      mergedData.purok,

    previousReading,

    currentReading,

    consumption,

    billAmount:
      consumption *
      WATER_RATE_PER_CUBIC_METER,

    readingDate:
      mergedData.readingDate,

    status:
      mergedData.status,
  };

  const result =
    await updateMeterReading(
      id,
      updatedReading
    );

  if (!result) {
    throw new Error(
      "Meter reading not found."
    );
  }

  return result;
}

export async function removeMeterReading(id) {
  const existing =
    await getMeterReadingById(id);

  if (!existing) {
    throw new Error(
      "Meter reading not found."
    );
  }

  await deleteMeterReading(id);

  return {
    message:
      "Meter reading deleted successfully.",
  };
}