import {
  fetchMeterReadings,
  fetchMeterReadingById,
  addMeterReading,
  editMeterReading,
  removeMeterReading,
} from "../services/meterReadingServices.js";

export async function getMeterReadings(
  req,
  res
) {
  try {
    const readings = await fetchMeterReadings();

    res.status(200).json(readings);

  } catch (error) {
    res.status(500).json({
      message:
        error.message ||
        "Failed to retrieve meter readings.",
    });
  }
}


export async function getMeterReading(
  req,
  res
) {
  try {
    const reading = await fetchMeterReadingById(
        req.params.id
      );

    res.status(200).json(reading);

  } catch (error) {

    if (
      error.message ===
      "Meter reading not found."
    ) {
      return res.status(404).json({
        message:
          error.message,
      });
    }

    res.status(500).json({
      message:
        error.message ||
        "Failed to retrieve meter reading.",
    });
  }
}


export async function createMeterReading(
  req,
  res
) {
  try {
    const reading = await addMeterReading(
        req.body
      );

    res.status(201).json({
      message:
        "Meter reading created successfully.",
      data: reading,
    });

  } catch (error) {

    if (
      error.status === 400
    ) {
      return res.status(400).json({
        message:
          "Validation failed.",
        errors:
          error.errors,
      });
    }

    res.status(500).json({
      message:
        error.message ||
        "Failed to create meter reading.",
    });
  }
}


export async function updateMeterReading(
  req,
  res
) {
  try {
    const reading = await editMeterReading(
        req.params.id,
        req.body
      );

    res.status(200).json({
      message:
        "Meter reading updated successfully.",
      data: reading,
    });

  } catch (error) {

    if (error.status === 409) {
      return res.status(409).json({
        message: error.message,
      });
    }

    if (
      error.status === 400
    ) {
      return res.status(400).json({
        message:
          "Validation failed.",
        errors:
          error.errors,
      });
    }


    if (
      error.message ===
      "Meter reading not found."
    ) {
      return res.status(404).json({
        message:
          error.message,
      });
    }


    res.status(500).json({
      message:
        error.message ||
        "Failed to update meter reading.",
    });
  }
}


export async function deleteMeterReading(
  req,
  res
) {
  try {
    const result = await removeMeterReading(
        req.params.id
      );

    res.status(200).json(result);

  } catch (error) {

    if (error.status === 409) {
      return res.status(409).json({
        message: error.message,
      });
    }

    if (
      error.message ===
      "Meter reading not found."
    ) {
      return res.status(404).json({
        message:
          error.message,
      });
    }


    res.status(500).json({
      message:
        error.message ||
        "Failed to delete meter reading.",
    });
  }
}
