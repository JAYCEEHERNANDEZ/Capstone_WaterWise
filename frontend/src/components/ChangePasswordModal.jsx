import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import {
  changePasswordWithCurrent,
  requestAuthenticatedPasswordOtp,
  resetPassword,
  verifyPasswordResetOtp,
} from "../services/auth.service";
import Modal from "./Modal";

const formatCountdown = (totalSeconds) => `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;

function isStrongPassword(password) {
  return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

export default function ChangePasswordModal({ emailOnly = false, isOpen, onClose, onSuccess }) {
  const [method, setMethod] = useState(emailOnly ? "email" : "current");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [challengeToken, setChallengeToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [clock, setClock] = useState(0);
  const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - clock) / 1000));

  useEffect(() => {
    if (!cooldownUntil) return undefined;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setClock(now);
      if (now >= cooldownUntil) window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  const validateNewPassword = () => {
    if (!isStrongPassword(newPassword)) return "Use at least 8 characters with uppercase, lowercase, a number, and a symbol.";
    if (newPassword !== confirmation) return "The new passwords do not match.";
    return "";
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateNewPassword();
    if (validationError) return setError(validationError);
    if (method === "current" && !currentPassword) return setError("Enter your current password.");
    setIsSubmitting(true);
    setError("");
    try {
      const result = method === "current"
        ? await changePasswordWithCurrent(currentPassword, newPassword)
        : await resetPassword(resetToken, newPassword);
      onSuccess?.(result.message);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendOtp = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const result = await requestAuthenticatedPasswordOtp();
      setChallengeToken(result.challengeToken);
      setMaskedEmail(result.maskedEmail);
      setMessage(result.message);
      setOtp("");
      setClock(Date.now());
      setCooldownUntil(Date.now() + 2 * 60 * 1000);
    } catch (requestError) {
      setError(requestError.message);
      if (requestError.retryAfterSeconds) {
        setClock(Date.now());
        setCooldownUntil(Date.now() + requestError.retryAfterSeconds * 1000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit verification code.");
    setIsSubmitting(true);
    setError("");
    try {
      const result = await verifyPasswordResetOtp(challengeToken, otp);
      setResetToken(result.resetToken);
      setMessage("Email verified. You can now create your new password.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = "ww-field mt-2 py-3 pl-4 pr-12";
  const passwordField = (id, label, value, setter, autoComplete) => (
    <div>
      <label className="text-sm font-semibold text-slate-900" htmlFor={id}>{label}</label>
      <div className="relative">
        <input autoComplete={autoComplete} className={fieldClass} disabled={isSubmitting} id={id} onChange={(event) => { setter(event.target.value); setError(""); }} type={showPasswords ? "text" : "password"} value={value} />
        <button aria-label={showPasswords ? "Hide passwords" : "Show passwords"} className="absolute inset-y-2 right-0 flex w-12 items-center justify-center text-slate-500" onClick={() => setShowPasswords((shown) => !shown)} type="button">{showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
      </div>
    </div>
  );

  return (
    <Modal description="Choose how you want to verify your identity." eyebrow="Account security" isOpen={isOpen} onClose={onClose} size="sm" title="Change password">
      <div className="p-5 sm:p-6">
        {!emailOnly && <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button className={`min-h-11 rounded-lg px-3 text-sm font-bold ${method === "current" ? "bg-white text-water-800 shadow-sm" : "text-slate-600"}`} onClick={() => { setMethod("current"); setError(""); setMessage(""); }} type="button"><KeyRound className="mr-2 inline h-4 w-4" />Current password</button>
          <button className={`min-h-11 rounded-lg px-3 text-sm font-bold ${method === "email" ? "bg-white text-water-800 shadow-sm" : "text-slate-600"}`} onClick={() => { setMethod("email"); setError(""); setMessage(""); }} type="button"><Mail className="mr-2 inline h-4 w-4" />Email OTP</button>
        </div>}

        {method === "current" && (
          <form className="mt-5 space-y-4" onSubmit={handlePasswordSubmit}>
            {passwordField("current-account-password", "Current password", currentPassword, setCurrentPassword, "current-password")}
            {passwordField("changed-account-password", "New password", newPassword, setNewPassword, "new-password")}
            {passwordField("confirm-account-password", "Confirm new password", confirmation, setConfirmation, "new-password")}
            <p className="text-xs leading-5 text-slate-500">Use 8 or more characters with uppercase, lowercase, a number, and a symbol.</p>
            {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
            <button className="ww-primary-button flex min-h-12 w-full items-center justify-center gap-2" disabled={isSubmitting} type="submit">{isSubmitting && <LoaderCircle className="h-5 w-5 animate-spin" />}{isSubmitting ? "Changing password…" : "Change password"}</button>
          </form>
        )}

        {method === "email" && !challengeToken && (
          <div className="mt-5 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-water-50 text-water-700"><Mail className="h-5 w-5" /></span>
            <p className="mt-3 text-sm leading-6 text-slate-600">We’ll send a 6-digit code to the email registered to your signed-in account.</p>
            {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-left text-sm font-semibold text-red-700" role="alert">{error}</p>}
            <button className="ww-primary-button mt-5 flex min-h-12 w-full items-center justify-center gap-2" disabled={isSubmitting || cooldownSeconds > 0} onClick={sendOtp} type="button">{isSubmitting && <LoaderCircle className="h-5 w-5 animate-spin" />}{isSubmitting ? "Sending code…" : cooldownSeconds > 0 ? `Try again in ${formatCountdown(cooldownSeconds)}` : "Send email code"}</button>
          </div>
        )}

        {method === "email" && challengeToken && !resetToken && (
          <form className="mt-5 space-y-4" onSubmit={verifyOtp}>
            <p className="text-sm text-slate-600">Enter the code sent to <strong>{maskedEmail}</strong>. It expires in 5 minutes.</p>
            <div><label className="text-sm font-semibold" htmlFor="account-password-otp">Verification code</label><input autoComplete="one-time-code" className="ww-field mt-2 py-3 text-center font-mono text-xl tracking-[0.35em]" id="account-password-otp" inputMode="numeric" maxLength={6} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, "")); setError(""); }} value={otp} /></div>
            {message && !error && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</p>}
            {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
            <button className="ww-primary-button flex min-h-12 w-full items-center justify-center gap-2" disabled={isSubmitting} type="submit">{isSubmitting && <LoaderCircle className="h-5 w-5 animate-spin" />}{isSubmitting ? "Verifying…" : "Verify code"}</button>
            <button className="w-full text-sm font-bold text-water-700 disabled:cursor-not-allowed disabled:text-slate-400" disabled={isSubmitting || cooldownSeconds > 0} onClick={sendOtp} type="button">{cooldownSeconds > 0 ? `Resend code in ${formatCountdown(cooldownSeconds)}` : "Resend code"}</button>
          </form>
        )}

        {method === "email" && resetToken && (
          <form className="mt-5 space-y-4" onSubmit={handlePasswordSubmit}>
            <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"><ShieldCheck className="h-5 w-5" />{message}</p>
            {passwordField("email-changed-password", "New password", newPassword, setNewPassword, "new-password")}
            {passwordField("email-confirm-password", "Confirm new password", confirmation, setConfirmation, "new-password")}
            <p className="text-xs leading-5 text-slate-500">Use 8 or more characters with uppercase, lowercase, a number, and a symbol.</p>
            {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
            <button className="ww-primary-button flex min-h-12 w-full items-center justify-center gap-2" disabled={isSubmitting} type="submit">{isSubmitting && <LoaderCircle className="h-5 w-5 animate-spin" />}{isSubmitting ? "Changing password…" : "Change password"}</button>
          </form>
        )}
      </div>
    </Modal>
  );
}
