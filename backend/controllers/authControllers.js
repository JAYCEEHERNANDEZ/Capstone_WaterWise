import jwt from "jsonwebtoken";
import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";
import {
  getJwtSecret,
  JWT_AUDIENCE,
  JWT_ISSUER,
} from "../config/auth.js";
import {
  authenticateAccount,
  changePasswordWithCurrent,
  findPasswordResetAccount,
  getPasswordResetAccountById,
  getPasswordHash,
  resetAccountPassword,
} from "../models/authModels.js";
import { sendAdminLoginOtp, sendPasswordResetOtp, sendStaffActionOtp } from "../services/passwordResetEmailService.js";
import { sendConsumerEmailChangeOtp } from "../services/passwordResetEmailService.js";
import { updateConsumer } from "../models/consumerModels.js";
import { updateAdmin } from "../models/adminModels.js";

const ADMIN_LOGIN_OTP_AUDIENCE = "waterwise-admin-login-otp";
const EMAIL_CHANGE_OTP_AUDIENCE = "waterwise-consumer-email-change-otp";
const EMAIL_CHANGE_AUDIENCE = "waterwise-consumer-email-change";
const OTP_AUDIENCE = "waterwise-password-reset-otp";
const RESET_AUDIENCE = "waterwise-password-reset";
const STAFF_ACTION_OTP_AUDIENCE = "waterwise-staff-action-otp";
const STAFF_ACTION_AUDIENCE = "waterwise-staff-action";
const RESET_RESPONSE = "If an active account uses that email, a verification code has been sent.";
const adminOtpAttempts = new Map();
const emailChangeOtpAttempts = new Map();
const staffActionAttempts = new Map();
const staffActionAuthorizations = new Map();
const STAFF_ACTIONS = {
  "create-admin": "create an Admin account",
  "create-meter-reader": "create a Meter Reader account",
  "update-admin": "change an Admin account",
  "update-meter-reader": "change a Meter Reader account",
};

function passwordFingerprint(passwordHash) {
  return createHash("sha256").update(String(passwordHash)).digest("hex");
}

function otpFingerprint(otp) {
  return createHmac("sha256", getJwtSecret()).update(String(otp)).digest("hex");
}

function valuesMatch(first, second) {
  const firstBuffer = Buffer.from(String(first));
  const secondBuffer = Buffer.from(String(second));
  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
}

function createAccessToken(user) {
  return jwt.sign(
    { role: user.role },
    getJwtSecret(),
    {
      subject: String(user.id),
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: "8h",
    },
  );
}

export async function requestStaffActionOtp(req, res) {
  try {
    const { action, targetId } = req.body ?? {};
    if (req.user.role !== "super-admin" || !STAFF_ACTIONS[action]) return res.status(403).json({ success: false, message: "Only the Super Admin can authorize staff management actions." });
    const parsedTargetId = action.startsWith("update-") ? Number(targetId) : null;
    if (action.startsWith("update-") && (!Number.isInteger(parsedTargetId) || parsedTargetId < 1)) return res.status(400).json({ success: false, message: "A valid staff account is required." });
    const account = await getPasswordResetAccountById(req.user.id, "super-admin");
    if (!account || account.status !== "active") return res.status(403).json({ success: false, message: "The Super Admin account is not active." });
    const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const challengeToken = jwt.sign({ role: "super-admin", action, targetId: parsedTargetId, otpHash: otpFingerprint(otp), passwordFingerprint: passwordFingerprint(account.password), emailFingerprint: passwordFingerprint(account.email.toLowerCase()) }, getJwtSecret(), { subject: String(account.id), issuer: JWT_ISSUER, audience: STAFF_ACTION_OTP_AUDIENCE, expiresIn: "10m", jwtid: createHash("sha256").update(`staff:${account.id}:${Date.now()}:${otp}`).digest("hex") });
    await sendStaffActionOtp({ email: account.email, otp, username: account.username, actionLabel: STAFF_ACTIONS[action] });
    return res.status(200).json({ success: true, challengeToken, maskedEmail: account.email.replace(/^(.{1,2}).*(@.*)$/, "$1***$2"), message: "A verification code was sent to the Super Admin email." });
  } catch (error) {
    return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Unable to send the staff authorization code." });
  }
}

export async function verifyStaffActionOtp(req, res) {
  try {
    const { challengeToken, otp } = req.body ?? {};
    if (!challengeToken || !/^\d{6}$/.test(String(otp ?? ""))) return res.status(400).json({ success: false, message: "Enter the 6-digit verification code." });
    const challenge = jwt.verify(challengeToken, getJwtSecret(), { issuer: JWT_ISSUER, audience: STAFF_ACTION_OTP_AUDIENCE });
    if (challenge.sub !== String(req.user.id) || req.user.role !== "super-admin" || !STAFF_ACTIONS[challenge.action] || !challenge.jti) throw new jwt.JsonWebTokenError("Invalid staff action challenge.");
    const state = staffActionAttempts.get(challenge.jti) ?? { attempts: 0, expiresAt: challenge.exp * 1000 };
    if (state.used || state.attempts >= 5) return res.status(429).json({ success: false, message: "This code can no longer be used. Request a new code." });
    const account = await getPasswordResetAccountById(req.user.id, "super-admin");
    const validAccount = account?.status === "active" && valuesMatch(passwordFingerprint(account.password), challenge.passwordFingerprint ?? "") && valuesMatch(passwordFingerprint(account.email.toLowerCase()), challenge.emailFingerprint ?? "");
    if (!validAccount || !valuesMatch(otpFingerprint(otp), challenge.otpHash ?? "")) {
      state.attempts += 1; staffActionAttempts.set(challenge.jti, state);
      return res.status(state.attempts >= 5 ? 429 : 400).json({ success: false, message: state.attempts >= 5 ? "Too many incorrect codes. Request a new code." : `Incorrect verification code. ${5 - state.attempts} attempts remaining.` });
    }
    staffActionAttempts.set(challenge.jti, { ...state, used: true });
    const authorizationToken = jwt.sign({ role: "super-admin", action: challenge.action, targetId: challenge.targetId ?? null, passwordFingerprint: challenge.passwordFingerprint, emailFingerprint: challenge.emailFingerprint }, getJwtSecret(), { subject: String(account.id), issuer: JWT_ISSUER, audience: STAFF_ACTION_AUDIENCE, expiresIn: "5m", jwtid: createHash("sha256").update(`authorized:${challenge.jti}`).digest("hex") });
    return res.status(200).json({ success: true, authorizationToken });
  } catch (error) {
    const isTokenError = error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError;
    return res.status(error.statusCode ?? (isTokenError ? 400 : 500)).json({ success: false, message: isTokenError ? "This staff verification session is invalid or expired." : error.message || "Unable to verify the code." });
  }
}

export const authorizeStaffAction = (expectedAction) => async (req, res, next) => {
  try {
    const token = req.get("x-staff-authorization") ?? "";
    const payload = jwt.verify(token, getJwtSecret(), { issuer: JWT_ISSUER, audience: STAFF_ACTION_AUDIENCE });
    if (req.user.role !== "super-admin" || payload.sub !== String(req.user.id) || payload.action !== expectedAction || !payload.jti) throw new jwt.JsonWebTokenError("Invalid staff authorization.");
    if (expectedAction.startsWith("update-") && Number(payload.targetId) !== Number(req.params.id)) throw new jwt.JsonWebTokenError("Authorization does not match this staff account.");
    const state = staffActionAuthorizations.get(payload.jti);
    if (state?.used) return res.status(403).json({ success: false, message: "This staff authorization has already been used." });
    const account = await getPasswordResetAccountById(req.user.id, "super-admin");
    const validAccount = account?.status === "active" && valuesMatch(passwordFingerprint(account.password), payload.passwordFingerprint ?? "") && valuesMatch(passwordFingerprint(account.email.toLowerCase()), payload.emailFingerprint ?? "");
    if (!validAccount) return res.status(403).json({ success: false, message: "The Super Admin credentials changed. Request a new verification code." });
    staffActionAuthorizations.set(payload.jti, { used: true, expiresAt: payload.exp * 1000 });
    return next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Verify the Super Admin email OTP before continuing." });
  }
};

export async function login(req, res) {
  try {
    const { email, identifier, password } = req.body ?? {};
    const user = await authenticateAccount(identifier ?? email, password);

    if (["admin", "super-admin"].includes(user.role)) {
      const account = await getPasswordResetAccountById(user.id, user.role);
      const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");
      const challengeToken = jwt.sign(
        {
          role: user.role,
          otpHash: otpFingerprint(otp),
          passwordFingerprint: passwordFingerprint(account.password),
        },
        getJwtSecret(),
        {
          subject: String(user.id),
          issuer: JWT_ISSUER,
          audience: ADMIN_LOGIN_OTP_AUDIENCE,
          expiresIn: "10m",
          jwtid: createHash("sha256").update(`${user.id}:${Date.now()}:${otp}`).digest("hex"),
        },
      );
      await sendAdminLoginOtp({ email: user.email, otp, username: user.username });
      return res.status(200).json({
        success: true,
        requiresOtp: true,
        challengeToken,
        maskedEmail: user.email.replace(/^(.{1,2}).*(@.*)$/, "$1***$2"),
        message: "A verification code was sent to your registered admin email.",
      });
    }

    return res.status(200).json({ success: true, token: createAccessToken(user), user });
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

export async function verifyAdminLoginOtp(req, res) {
  try {
    for (const [challengeId, state] of adminOtpAttempts) {
      if (state.expiresAt <= Date.now()) adminOtpAttempts.delete(challengeId);
    }
    const { challengeToken, otp } = req.body ?? {};
    if (!challengeToken || !/^\d{6}$/.test(String(otp ?? ""))) {
      const error = new Error("Enter the 6-digit verification code.");
      error.statusCode = 400;
      error.field = "otp";
      throw error;
    }

    const challenge = jwt.verify(challengeToken, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: ADMIN_LOGIN_OTP_AUDIENCE,
    });
    if (!["admin", "super-admin"].includes(challenge.role) || !challenge.jti) throw new jwt.JsonWebTokenError("Invalid admin challenge.");

    const attemptState = adminOtpAttempts.get(challenge.jti) ?? { attempts: 0, expiresAt: challenge.exp * 1000 };
    if (attemptState.used) {
      const error = new Error("This verification code has already been used. Sign in again to request a new code.");
      error.statusCode = 400;
      throw error;
    }
    if (attemptState.attempts >= 5) {
      const error = new Error("Too many incorrect codes. Sign in again to request a new code.");
      error.statusCode = 429;
      throw error;
    }

    const account = await getPasswordResetAccountById(challenge.sub, challenge.role);
    const otpMatches = valuesMatch(otpFingerprint(otp), challenge.otpHash ?? "");
    const accountMatches = account?.status === "active" && valuesMatch(passwordFingerprint(account.password), challenge.passwordFingerprint ?? "");
    if (!otpMatches || !accountMatches) {
      attemptState.attempts += 1;
      adminOtpAttempts.set(challenge.jti, attemptState);
      const remaining = 5 - attemptState.attempts;
      const error = new Error(remaining > 0 ? `Incorrect verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` : "Too many incorrect codes. Sign in again to request a new code.");
      error.statusCode = remaining > 0 ? 400 : 429;
      error.field = "otp";
      throw error;
    }

    adminOtpAttempts.set(challenge.jti, { ...attemptState, used: true });
    const user = { id: account.id, username: account.username, email: account.email, name: account.username, role: account.role };
    return res.status(200).json({ success: true, token: createAccessToken(user), user });
  } catch (error) {
    const isTokenError = error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError;
    return res.status(error.statusCode ?? (isTokenError ? 400 : 500)).json({
      success: false,
      message: isTokenError ? "This admin verification session is invalid or has expired. Sign in again." : error.message || "Unable to verify the code.",
      ...(error.field ? { field: error.field } : {}),
    });
  }
}

export async function requestConsumerEmailChangeOtp(req, res) {
  try {
    const account = await getPasswordResetAccountById(req.user.id, req.user.role);
    if (!["admin", "super-admin", "consumer"].includes(req.user.role) || !account || account.status !== "active") {
      return res.status(403).json({ success: false, message: "Only active accounts can change their email." });
    }
    const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const challengeToken = jwt.sign(
      {
        role: req.user.role,
        otpHash: otpFingerprint(otp),
        passwordFingerprint: passwordFingerprint(account.password),
        emailFingerprint: passwordFingerprint(account.email.toLowerCase()),
      },
      getJwtSecret(),
      {
        subject: String(account.id), issuer: JWT_ISSUER, audience: EMAIL_CHANGE_OTP_AUDIENCE,
        expiresIn: "10m", jwtid: createHash("sha256").update(`email:${account.id}:${Date.now()}:${otp}`).digest("hex"),
      },
    );
    await sendConsumerEmailChangeOtp({ email: account.email, otp, username: account.username });
    return res.status(200).json({
      success: true,
      challengeToken,
      maskedEmail: account.email.replace(/^(.{1,2}).*(@.*)$/, "$1***$2"),
      message: "A verification code was sent to your current email address.",
    });
  } catch (error) {
    return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Unable to send the verification code." });
  }
}

export async function verifyConsumerEmailChangeOtp(req, res) {
  try {
    for (const [challengeId, state] of emailChangeOtpAttempts) {
      if (state.expiresAt <= Date.now()) emailChangeOtpAttempts.delete(challengeId);
    }
    const { challengeToken, otp } = req.body ?? {};
    if (!challengeToken || !/^\d{6}$/.test(String(otp ?? ""))) {
      const error = new Error("Enter the 6-digit verification code."); error.statusCode = 400; throw error;
    }
    const challenge = jwt.verify(challengeToken, getJwtSecret(), { issuer: JWT_ISSUER, audience: EMAIL_CHANGE_OTP_AUDIENCE });
    if (challenge.sub !== String(req.user.id) || challenge.role !== req.user.role || !challenge.jti) throw new jwt.JsonWebTokenError("Invalid email challenge.");
    const state = emailChangeOtpAttempts.get(challenge.jti) ?? { attempts: 0, expiresAt: challenge.exp * 1000 };
    if (state.used || state.attempts >= 5) {
      const error = new Error("This code can no longer be used. Request a new code."); error.statusCode = 429; throw error;
    }
    const account = await getPasswordResetAccountById(req.user.id, "consumer");
    const validAccount = account?.status === "active" && valuesMatch(passwordFingerprint(account.password), challenge.passwordFingerprint ?? "") && valuesMatch(passwordFingerprint(account.email.toLowerCase()), challenge.emailFingerprint ?? "");
    if (!validAccount || !valuesMatch(otpFingerprint(otp), challenge.otpHash ?? "")) {
      state.attempts += 1; emailChangeOtpAttempts.set(challenge.jti, state);
      const remaining = 5 - state.attempts;
      const error = new Error(remaining > 0 ? `Incorrect verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` : "Too many incorrect codes. Request a new code.");
      error.statusCode = remaining > 0 ? 400 : 429; throw error;
    }
    emailChangeOtpAttempts.set(challenge.jti, { ...state, used: true });
    const emailChangeToken = jwt.sign(
      { role: req.user.role, emailFingerprint: passwordFingerprint(account.email.toLowerCase()) },
      getJwtSecret(),
      { subject: String(account.id), issuer: JWT_ISSUER, audience: EMAIL_CHANGE_AUDIENCE, expiresIn: "15m" },
    );
    return res.status(200).json({ success: true, emailChangeToken });
  } catch (error) {
    const isTokenError = error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError;
    return res.status(error.statusCode ?? (isTokenError ? 400 : 500)).json({ success: false, message: isTokenError ? "This verification session is invalid or expired." : error.message || "Unable to verify the code." });
  }
}

export async function completeConsumerEmailChange(req, res) {
  try {
    const { emailChangeToken, newEmail } = req.body ?? {};
    const payload = jwt.verify(emailChangeToken, getJwtSecret(), { issuer: JWT_ISSUER, audience: EMAIL_CHANGE_AUDIENCE });
    if (payload.sub !== String(req.user.id) || payload.role !== req.user.role || !["admin", "super-admin", "consumer"].includes(req.user.role)) throw new jwt.JsonWebTokenError("Invalid email change session.");
    const account = await getPasswordResetAccountById(req.user.id, req.user.role);
    if (!account || !valuesMatch(passwordFingerprint(account.email.toLowerCase()), payload.emailFingerprint ?? "")) {
      const error = new Error("This email change session has already been used or is invalid."); error.statusCode = 400; throw error;
    }
    if (String(newEmail ?? "").trim().toLowerCase() === account.email.toLowerCase()) {
      const error = new Error("Enter a new email address that is different from your current email."); error.statusCode = 400; throw error;
    }
    const updated = ["admin", "super-admin"].includes(req.user.role)
      ? await updateAdmin(req.user.id, { email: newEmail })
      : await updateConsumer(req.user.id, { email: newEmail });
    return res.status(200).json({ success: true, message: "Your email address has been changed successfully.", email: updated.email });
  } catch (error) {
    const isTokenError = error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError;
    return res.status(error.statusCode ?? (isTokenError ? 400 : 500)).json({ success: false, message: isTokenError ? "This email change session is invalid or expired." : error.message || "Unable to change email." });
  }
}

export async function forgotPassword(req, res) {
  try {
    const account = await findPasswordResetAccount(req.body?.email);
    let challengeToken;
    if (account?.status === "active") {
      const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");
      challengeToken = jwt.sign(
        {
          role: account.role,
          otpHash: otpFingerprint(otp),
          passwordFingerprint: passwordFingerprint(account.password),
        },
        getJwtSecret(),
        {
          subject: String(account.id),
          issuer: JWT_ISSUER,
          audience: OTP_AUDIENCE,
          expiresIn: "10m",
        },
      );
      await sendPasswordResetOtp({ email: account.email, otp, username: account.username });
    } else {
      challengeToken = jwt.sign(
        { role: "unknown", otpHash: otpFingerprint(String(randomInt(0, 1_000_000)).padStart(6, "0")) },
        getJwtSecret(),
        { subject: "0", issuer: JWT_ISSUER, audience: OTP_AUDIENCE, expiresIn: "10m" },
      );
    }
    return res.status(200).json({ success: true, message: RESET_RESPONSE, challengeToken });
  } catch (error) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.statusCode === 400 ? error.message : "Unable to send a reset email right now.",
      ...(error.field ? { field: error.field } : {}),
    });
  }
}

function createOtpChallenge(account, otp) {
  return jwt.sign(
    {
      role: account.role,
      otpHash: otpFingerprint(otp),
      passwordFingerprint: passwordFingerprint(account.password),
    },
    getJwtSecret(),
    {
      subject: String(account.id),
      issuer: JWT_ISSUER,
      audience: OTP_AUDIENCE,
      expiresIn: "10m",
    },
  );
}

export async function requestAuthenticatedPasswordOtp(req, res) {
  try {
    const account = await getPasswordResetAccountById(req.user.id, req.user.role);
    if (!account || account.status !== "active") {
      return res.status(404).json({ success: false, message: "Active account not found." });
    }
    const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const challengeToken = createOtpChallenge(account, otp);
    await sendPasswordResetOtp({ email: account.email, otp, username: account.username });
    return res.status(200).json({
      success: true,
      message: "A verification code was sent to your registered email address.",
      challengeToken,
      maskedEmail: account.email.replace(/^(.{1,2}).*(@.*)$/, "$1***$2"),
    });
  } catch (error) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Unable to send a verification code.",
    });
  }
}

export async function changeAuthenticatedPassword(req, res) {
  try {
    await changePasswordWithCurrent({
      accountId: req.user.id,
      role: req.user.role,
      currentPassword: req.body?.currentPassword,
      newPassword: req.body?.newPassword,
    });
    return res.status(200).json({ success: true, message: "Your password has been changed successfully." });
  } catch (error) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Unable to change password.",
      ...(error.field ? { field: error.field } : {}),
    });
  }
}

export async function verifyPasswordResetOtp(req, res) {
  try {
    const { challengeToken, otp } = req.body ?? {};
    if (!challengeToken || !/^\d{6}$/.test(String(otp ?? ""))) {
      const error = new Error("Enter the 6-digit verification code.");
      error.statusCode = 400;
      error.field = "otp";
      throw error;
    }

    const challenge = jwt.verify(challengeToken, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: OTP_AUDIENCE,
    });
    const currentHash = await getPasswordHash(challenge.sub, challenge.role);
    const otpMatches = valuesMatch(otpFingerprint(otp), challenge.otpHash ?? "");
    const accountMatches = currentHash && valuesMatch(passwordFingerprint(currentHash), challenge.passwordFingerprint ?? "");
    if (!otpMatches || !accountMatches) {
      const error = new Error("The verification code is incorrect or has expired.");
      error.statusCode = 400;
      error.field = "otp";
      throw error;
    }

    const resetToken = jwt.sign(
      { role: challenge.role, passwordFingerprint: passwordFingerprint(currentHash) },
      getJwtSecret(),
      {
        subject: String(challenge.sub),
        issuer: JWT_ISSUER,
        audience: RESET_AUDIENCE,
        expiresIn: "15m",
      },
    );
    return res.status(200).json({ success: true, resetToken });
  } catch (error) {
    const isTokenError = error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError;
    return res.status(error.statusCode ?? (isTokenError ? 400 : 500)).json({
      success: false,
      message: isTokenError ? "The verification code is incorrect or has expired." : error.message || "Unable to verify the code.",
      ...(error.field ? { field: error.field } : {}),
    });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body ?? {};
    if (!token) {
      const error = new Error("This password reset session is invalid or has expired.");
      error.statusCode = 400;
      throw error;
    }

    const payload = jwt.verify(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: RESET_AUDIENCE,
    });
    const currentHash = await getPasswordHash(payload.sub, payload.role);
    if (!currentHash || passwordFingerprint(currentHash) !== payload.passwordFingerprint) {
      const error = new Error("This password reset session is invalid or has already been used.");
      error.statusCode = 400;
      throw error;
    }

    const updated = await resetAccountPassword({ accountId: payload.sub, password, role: payload.role });
    if (!updated) {
      const error = new Error("This password reset session is invalid or has expired.");
      error.statusCode = 400;
      throw error;
    }
    return res.status(200).json({ success: true, message: "Your password has been reset. You can now sign in." });
  } catch (error) {
    const isTokenError = error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError;
    return res.status(error.statusCode ?? (isTokenError ? 400 : 500)).json({
      success: false,
      message: isTokenError ? "This password reset session is invalid or has expired." : error.message || "Unable to reset password.",
      ...(error.field ? { field: error.field } : {}),
    });
  }
}
