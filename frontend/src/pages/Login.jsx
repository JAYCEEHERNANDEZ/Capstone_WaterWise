import { useRef, useState } from "react";
import {
  FiDroplet,
  FiEye,
  FiEyeOff,
  FiLoader,
  FiLock,
  FiMail,
} from "react-icons/fi";
import { useNavigate } from "react-router";
import { login } from "../services/auth.service";
import { useToast } from "../components/Toast";

const accountDestinations = {
  admin: "/admin/dashboard",
  "meter-reader": "/meter-reader/readings-entry",
  consumer: "/consumer/usage-metrics",
};

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const identifierRef = useRef(null);
  const passwordRef = useRef(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedIdentifier = identifier.trim();
    const nextIdentifierError = !trimmedIdentifier
      ? "Enter your email address or username."
      : trimmedIdentifier.includes("@") &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedIdentifier)
        ? "Enter a valid email address, such as name@example.com."
        : "";
    const nextPasswordError = !password
      ? "Enter your password."
      : "";

    setIdentifierError(nextIdentifierError);
    setPasswordError(nextPasswordError);

    if (nextIdentifierError || nextPasswordError) {
      setMessage("");
      requestAnimationFrame(() => {
        if (nextIdentifierError) {
          identifierRef.current?.focus();
        } else {
          passwordRef.current?.focus();
        }
      });
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setIdentifierError("");
    setPasswordError("");

    try {
      const result = await login({ email: trimmedIdentifier, password });
      const authenticatedRole = result.user?.role === "tenant"
        ? "consumer"
        : result.user?.role;
      const destination = accountDestinations[authenticatedRole];

      if (!destination) {
        throw new Error("This account does not have access to a WaterWise workspace.");
      }

      toast.success("Signed in", `Welcome back, ${result.user?.username ?? "WaterWise user"}.`);
      navigate(destination);
    } catch (error) {
      const status = error.cause?.response?.status;
      const errorField = error.cause?.response?.data?.field;
      const isCredentialError =
        [400, 401].includes(status) ||
        /invalid (email|username|password|credentials)/i.test(error.message);

      if (isCredentialError && errorField === "identifier") {
        setIdentifierError(error.message || "Email address or username was not found.");
        setPasswordError("");
        setMessage("");
        requestAnimationFrame(() => identifierRef.current?.focus());
      } else if (isCredentialError && errorField === "password") {
        setIdentifierError("");
        setPasswordError(error.message || "Incorrect password.");
        setMessage("");
        requestAnimationFrame(() => passwordRef.current?.focus());
      } else if (isCredentialError) {
        setIdentifierError("");
        setPasswordError("Incorrect password.");
        setMessage("");
        requestAnimationFrame(() => passwordRef.current?.focus());
      } else {
        const nextMessage = error.message || "We couldn't sign you in. Try again.";
        setMessage(nextMessage);
        toast.error("Sign-in failed", nextMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="ww-app min-h-screen px-4 py-4 font-sans text-slate-900 sm:px-8 sm:py-8 lg:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center justify-center sm:min-h-[calc(100vh-4rem)]">
        <div className="ww-glass-strong grid w-full overflow-hidden rounded-2xl lg:grid-cols-[0.94fr_1.06fr]">
          <aside className="ww-page-header relative flex flex-col rounded-none border-0 p-6 text-white shadow-none sm:p-10 lg:min-h-[650px]">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-water-600 text-white shadow-sm"><FiDroplet aria-hidden="true" className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-extrabold tracking-[-0.02em] text-white">WaterWise</p>
                  <p className="text-xs font-medium text-water-200">Sucol Water System</p>
                </div>
              </div>
              <h1 className="mt-6 max-w-md text-3xl font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-5xl">
                Every drop, clearly understood.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-water-100 sm:text-base">One secure place for water readings, bills, payments, and barangay updates.</p>
            </div>

          </aside>

          <div className="bg-white p-6 sm:p-10 lg:flex lg:items-center lg:p-12">
            <div className="mx-auto max-w-xl">
              <div className="mb-7">
                <p className="ww-eyebrow !text-water-700">
                  Secure sign in
                </p>
                <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-slate-900 sm:text-4xl">
                  Sign in to your account
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Use the credentials assigned to your WaterWise account.
                </p>
              </div>

              <form aria-busy={isSubmitting} className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    className="text-sm font-semibold text-slate-900"
                    htmlFor="login-identifier"
                  >
                    Email or username
                  </label>
                  <div className="relative mt-2">
                    <FiMail aria-hidden="true" className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${identifierError ? "text-red-500" : "text-slate-400"}`} />
                    <input
                      aria-describedby={identifierError ? "login-identifier-error" : undefined}
                      aria-invalid={Boolean(identifierError)}
                      autoComplete="username"
                      className="ww-field py-3 pl-12 pr-4 text-base"
                      disabled={isSubmitting}
                      id="login-identifier"
                      onChange={(event) => {
                        setIdentifier(event.target.value);
                        if (identifierError) setIdentifierError("");
                        if (message) setMessage("");
                      }}
                      placeholder="name@sucolwater.gov"
                      ref={identifierRef}
                      type="text"
                      value={identifier}
                    />
                  </div>
                  {identifierError && (
                    <p className="mt-2 text-sm font-semibold text-red-700" id="login-identifier-error">
                      {identifierError}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="text-sm font-semibold text-slate-900"
                    htmlFor="login-password"
                  >
                    Password
                  </label>
                  <div className="relative mt-2">
                    <FiLock aria-hidden="true" className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${passwordError ? "text-red-500" : "text-slate-400"}`} />
                    <input
                      aria-describedby={passwordError ? "login-password-error" : undefined}
                      aria-invalid={Boolean(passwordError)}
                      autoComplete="current-password"
                      className="ww-field py-3 pl-12 pr-12 text-base"
                      disabled={isSubmitting}
                      id="login-password"
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (passwordError) setPasswordError("");
                        if (message) setMessage("");
                      }}
                      placeholder="Enter password"
                      ref={passwordRef}
                      type={showPassword ? "text" : "password"}
                      value={password}
                    />
                    <button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-500 transition hover:text-water-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-water-600"
                      disabled={isSubmitting}
                      onClick={() => setShowPassword((visible) => !visible)}
                      type="button"
                    >
                      {showPassword ? (
                        <FiEyeOff aria-hidden="true" className="h-5 w-5" />
                      ) : (
                        <FiEye aria-hidden="true" className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-2 text-sm font-semibold text-red-700" id="login-password-error">
                      {passwordError}
                    </p>
                  )}
                </div>

                <button
                  className="ww-primary-button flex min-h-12 w-full items-center justify-center gap-2 px-5 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 focus-visible:ring-offset-2 disabled:cursor-default disabled:bg-water-500 disabled:opacity-90"
                  disabled={isSubmitting}
                  style={{ cursor: isSubmitting ? "default" : undefined }}
                  type="submit"
                >
                  {isSubmitting && <FiLoader aria-hidden="true" className="h-5 w-5 animate-spin" />}
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </button>

                <span aria-live="polite" className="sr-only" role="status">
                  {isSubmitting ? "Signing in. Please wait." : ""}
                </span>

                {message && (
                  <p
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                    role="status"
                  >
                    {message}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
