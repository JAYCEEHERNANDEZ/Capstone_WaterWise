import {
  createAdmin,
  deleteAdmin,
  getAdminById,
  getAdmins,
  updateAdmin,
} from "../models/adminModels.js";

const sendError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.statusCode ?? 500).json({
    success: false,
    message: error.message || fallbackMessage,
  });
};

export const registerAdmin = async (req, res) => {
  try {
    const { username, password, email } = req.body ?? {};
    const admin = await createAdmin(username, password, email);

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully.",
      data: admin,
    });
  } catch (error) {
    return sendError(res, error, "Failed to create admin account.");
  }
};

export const listAdmins = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: await getAdmins() });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve admins.");
  }
};

export const showAdmin = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: await getAdminById(req.params.id),
    });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve admin.");
  }
};

export const editAdmin = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Admin account updated successfully.",
      data: await updateAdmin(req.params.id, req.body ?? {}),
    });
  } catch (error) {
    return sendError(res, error, "Failed to update admin account.");
  }
};

export const removeAdmin = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Admin account deleted successfully.",
      data: await deleteAdmin(req.params.id),
    });
  } catch (error) {
    return sendError(res, error, "Failed to delete admin account.");
  }
};
