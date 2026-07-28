import {
  createMeterReader,
  deleteMeterReader,
  getMeterReaderById,
  getMeterReaders,
  updateMeterReader,
} from "../models/meterReaderModels.js";

const sendError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.statusCode ?? 500).json({
    success: false,
    message: error.message || fallbackMessage,
  });
};

export const registerMeterReader = async (req, res) => {
  try {
    const { username, password, email } = req.body ?? {};
    const meterReader = await createMeterReader(username, password, email);

    return res.status(201).json({
      success: true,
      message: "Meter reader account created successfully.",
      data: meterReader,
    });
  } catch (error) {
    return sendError(res, error, "Failed to create meter reader account.");
  }
};

export const listMeterReaders = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: await getMeterReaders(),
    });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve meter readers.");
  }
};

export const showMeterReader = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: await getMeterReaderById(req.params.id),
    });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve meter reader.");
  }
};

export const editMeterReader = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Meter reader account updated successfully.",
      data: await updateMeterReader(req.params.id, req.body ?? {}),
    });
  } catch (error) {
    return sendError(res, error, "Failed to update meter reader account.");
  }
};

export const removeMeterReader = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Meter reader account deleted successfully.",
      data: await deleteMeterReader(req.params.id),
    });
  } catch (error) {
    return sendError(res, error, "Failed to delete meter reader account.");
  }
};
