import jwt from "jsonwebtoken";
import {
  getJwtSecret,
  JWT_AUDIENCE,
  JWT_ISSUER,
} from "../config/auth.js";
import { authenticateAccount } from "../models/authModels.js";

export async function login(req, res) {
  try {
    const { email, identifier, password } = req.body ?? {};
    const user = await authenticateAccount(identifier ?? email, password);

    const token = jwt.sign(
      { role: user.role },
      getJwtSecret(),
      {
        subject: String(user.id),
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        expiresIn: "8h",
      }
    );

    return res.status(200).json({ success: true, token, user });
  } catch (error) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Login failed.",
      ...(error.field ? { field: error.field } : {}),
      ...(error.retryAfterSeconds
        ? { retryAfterSeconds: error.retryAfterSeconds }
        : {}),
      ...(Number.isInteger(error.failedAttempts)
        ? { failedAttempts: error.failedAttempts }
        : {}),
      ...(Number.isInteger(error.remainingAttempts)
        ? { remainingAttempts: error.remainingAttempts }
        : {}),
    });
  }
}

export function currentAccount(req, res) {
  return res.status(200).json({ success: true, user: req.user });
}
