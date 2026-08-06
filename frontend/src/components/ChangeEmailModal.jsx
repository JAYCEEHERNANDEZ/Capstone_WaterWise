import { useEffect, useState } from "react";
import { Building2, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import { completeConsumerEmailChange, requestConsumerEmailChangeOtp, verifyConsumerEmailChangeOtp } from "../services/auth.service";
import Modal from "./Modal";

const formatCountdown = (totalSeconds) => `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;

export default function ChangeEmailModal({ accountRole = "consumer", isOpen, onClose, onSuccess }) {
  const [challengeToken, setChallengeToken] = useState("");
  const [emailChangeToken, setEmailChangeToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newEmail, setNewEmail] = useState("");
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

  const sendOtp = async () => {
    setIsSubmitting(true); setError("");
    try {
      const result = await requestConsumerEmailChangeOtp();
      setChallengeToken(result.challengeToken); setMaskedEmail(result.maskedEmail); setMessage(result.message); setOtp(""); setClock(Date.now()); setCooldownUntil(Date.now() + 2 * 60 * 1000);
    } catch (requestError) { setError(requestError.message); if (requestError.retryAfterSeconds) { setClock(Date.now()); setCooldownUntil(Date.now() + requestError.retryAfterSeconds * 1000); } }
    finally { setIsSubmitting(false); }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit verification code.");
    setIsSubmitting(true); setError("");
    try {
      const result = await verifyConsumerEmailChangeOtp(challengeToken, otp);
      setEmailChangeToken(result.emailChangeToken); setMessage("Current email verified. Enter your new email address.");
    } catch (requestError) { setError(requestError.message); }
    finally { setIsSubmitting(false); }
  };

  const changeEmail = async (event) => {
    event.preventDefault();
    const normalizedEmail = newEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return setError("Enter a valid complete email address, such as name@example.com.");
    setIsSubmitting(true); setError("");
    try {
      const result = await completeConsumerEmailChange(emailChangeToken, normalizedEmail);
      onSuccess?.(result); onClose();
    } catch (requestError) { setError(requestError.message); }
    finally { setIsSubmitting(false); }
  };

  return (
    <Modal description="Verify your current registered email before replacing it." eyebrow="Account security" isOpen={isOpen} onClose={onClose} size="sm" title="Change email address">
      <div className="p-5 sm:p-6">
        {!challengeToken && <div className="text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-water-50 text-water-700"><Mail className="h-5 w-5" /></span><p className="mt-3 text-sm leading-6 text-slate-600">We’ll send a 6-digit verification code to your current registered email address.</p><button className="ww-primary-button mt-5 flex min-h-12 w-full items-center justify-center gap-2" disabled={isSubmitting || cooldownSeconds > 0} onClick={sendOtp} type="button">{isSubmitting && <LoaderCircle className="h-5 w-5 animate-spin" />}{isSubmitting ? "Sending code…" : cooldownSeconds > 0 ? `Try again in ${formatCountdown(cooldownSeconds)}` : "Send verification code"}</button></div>}

        {challengeToken && !emailChangeToken && <form className="space-y-4" onSubmit={verifyOtp}><p className="text-sm text-slate-600">Enter the code sent to <strong>{maskedEmail}</strong>. It expires in 5 minutes.</p><div><label className="text-sm font-semibold" htmlFor="email-change-otp">Verification code</label><input autoComplete="one-time-code" className="ww-field mt-2 py-3 text-center font-mono text-xl tracking-[0.35em]" id="email-change-otp" inputMode="numeric" maxLength={6} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, "")); setError(""); }} value={otp} /></div>{message && !error && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</p>}<button className="ww-primary-button flex min-h-12 w-full items-center justify-center gap-2" disabled={isSubmitting} type="submit">{isSubmitting && <LoaderCircle className="h-5 w-5 animate-spin" />}{isSubmitting ? "Verifying…" : "Verify current email"}</button><button className="w-full text-sm font-bold text-water-700 disabled:cursor-not-allowed disabled:text-slate-400" disabled={isSubmitting || cooldownSeconds > 0} onClick={sendOtp} type="button">{cooldownSeconds > 0 ? `Resend code in ${formatCountdown(cooldownSeconds)}` : "Resend code"}</button></form>}

        {emailChangeToken && <form className="space-y-4" onSubmit={changeEmail}><p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"><ShieldCheck className="h-5 w-5" />{message}</p><div><label className="text-sm font-semibold" htmlFor="new-consumer-email">New email address</label><input autoComplete="email" className="ww-field mt-2 py-3" id="new-consumer-email" onChange={(event) => { setNewEmail(event.target.value); setError(""); }} placeholder="name@example.com" type="email" value={newEmail} /></div><button className="ww-primary-button flex min-h-12 w-full items-center justify-center gap-2" disabled={isSubmitting} type="submit">{isSubmitting && <LoaderCircle className="h-5 w-5 animate-spin" />}{isSubmitting ? "Changing email…" : "Save new email"}</button></form>}

        {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
        <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"><Building2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><p className="text-sm leading-6 text-amber-900"><strong>Can’t remember or access your current email?</strong> {accountRole === "consumer" ? "Please visit the Sucol Water System office so staff can verify your identity and update the email safely." : "Contact the authorized system administrator for identity verification and account recovery."}</p></div>
      </div>
    </Modal>
  );
}
