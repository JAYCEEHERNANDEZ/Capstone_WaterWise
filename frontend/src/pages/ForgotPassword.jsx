import { useState } from "react";
import { FiArrowLeft, FiDroplet, FiHash, FiLoader, FiMail } from "react-icons/fi";
import { Link, useNavigate } from "react-router";
import { requestPasswordReset, verifyPasswordResetOtp } from "../services/auth.service";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (challengeToken) {
      if (!/^\d{6}$/.test(otp)) {
        setError("Enter the 6-digit verification code.");
        return;
      }
      setIsSubmitting(true);
      setError("");
      try {
        const result = await verifyPasswordResetOtp(challengeToken, otp);
        navigate(`/reset-password?token=${encodeURIComponent(result.resetToken)}`, { replace: true });
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address, such as name@example.com.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setMessage("");
    try {
      const result = await requestPasswordReset(normalizedEmail);
      setChallengeToken(result.challengeToken);
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="ww-app flex min-h-screen items-center justify-center px-4 py-8 font-sans text-slate-900">
      <section className="ww-glass-strong w-full max-w-lg rounded-2xl bg-white p-6 sm:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-water-600 text-white"><FiDroplet className="h-5 w-5" /></span>
        <p className="ww-eyebrow mt-6 !text-water-700">Account recovery</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">{challengeToken ? "Verify your email" : "Forgot your password?"}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{challengeToken ? `Enter the 6-digit code sent to ${email.trim()}. The code expires in 10 minutes.` : "Enter the email address registered to your WaterWise account. We’ll send you a verification code."}</p>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          {!challengeToken ? <div>
            <label className="text-sm font-semibold" htmlFor="recovery-email">Email address</label>
            <div className="relative mt-2">
              <FiMail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input aria-invalid={Boolean(error)} autoComplete="email" className="ww-field py-3 pl-12 pr-4" disabled={isSubmitting} id="recovery-email" onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder="name@example.com" type="email" value={email} />
            </div>
          </div> : <div>
            <label className="text-sm font-semibold" htmlFor="recovery-otp">Verification code</label>
            <div className="relative mt-2">
              <FiHash className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input aria-invalid={Boolean(error)} autoComplete="one-time-code" className="ww-field py-3 pl-12 pr-4 font-mono text-lg tracking-[0.3em]" disabled={isSubmitting} id="recovery-otp" inputMode="numeric" maxLength={6} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, "")); setError(""); }} placeholder="000000" type="text" value={otp} />
            </div>
          </div>}
          {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
          {message && challengeToken && !error && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800" role="status">{message}</p>}
          <button className="ww-primary-button flex min-h-12 w-full items-center justify-center gap-2" disabled={isSubmitting} type="submit">{isSubmitting && <FiLoader className="h-5 w-5 animate-spin" />}{isSubmitting ? (challengeToken ? "Verifying code…" : "Sending code…") : (challengeToken ? "Verify code" : "Send verification code")}</button>
          {challengeToken && <button className="w-full text-sm font-bold text-water-700 hover:text-water-900" onClick={() => { setChallengeToken(""); setOtp(""); setMessage(""); setError(""); }} type="button">Use a different email or resend code</button>}
        </form>
        <Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-water-700 hover:text-water-900" to="/login"><FiArrowLeft /> Back to sign in</Link>
      </section>
    </main>
  );
}
