import { useState } from "react";
import {
  FiCheckCircle,
  FiClipboard,
  FiDroplet,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
} from "react-icons/fi";
import { useNavigate } from "react-router";
import { login } from "../services/auth.service";

const roles = [
  {
    id: "admin",
    label: "Admin",
    eyebrow: "Barangay officials",
    Icon: FiShield,
    route: "/admin/dashboard",
  },
  {
    id: "meter-reader",
    label: "Meter Reader",
    eyebrow: "Field personnel",
    Icon: FiClipboard,
    route: "/meter-reader/readings-entry",
  },
  {
    id: "consumer",
    label: "Consumer",
    eyebrow: "Community portal",
    Icon: FiDroplet,
    route: "/consumer/usage-metrics",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier || !password.trim()) {
      setMessage("Enter your credentials to continue.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const result = await login({ email: trimmedIdentifier, password });
      const authenticatedRole = result.user?.role === "tenant"
        ? "consumer"
        : result.user?.role;
      const destination = roles.find(({ id }) => id === authenticatedRole);

      if (!destination) {
        throw new Error("Your account role does not have a configured portal.");
      }

      setMessage(`Signed in as ${destination.label}.`);
      navigate(destination.route);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28rem)] px-4 py-4 font-[Inter,system-ui,sans-serif] text-[#0F172A] sm:px-8 sm:py-8 lg:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center justify-center sm:min-h-[calc(100vh-4rem)]">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0F172A] via-slate-900 to-sky-950 p-6 text-white sm:p-10 lg:min-h-[650px]">
            <div aria-hidden="true" className="absolute -right-20 -top-20 h-56 w-56 rounded-full border-[32px] border-sky-400/10" />
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-950/30"><FiDroplet aria-hidden="true" className="h-5 w-5" /></span>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-200">WaterWise</p>
              </div>
              <h1 className="mt-6 max-w-md text-3xl font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-5xl">
                Every drop, clearly understood.
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-300 sm:text-base">Secure access to Sucol Water System services, wherever you are.</p>
            </div>

          </aside>

          <div className="p-6 sm:p-10 lg:flex lg:items-center lg:p-12">
            <div className="mx-auto max-w-xl">
              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0284C7]">
                  Secure sign in
                </p>
                <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#0F172A] sm:text-4xl">
                  Sign in to your account
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Use the credentials assigned to your WaterWise account.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    className="text-sm font-semibold text-[#0F172A]"
                    htmlFor="login-identifier"
                  >
                    Email or username
                  </label>
                  <div className="relative mt-2">
                    <FiMail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      autoComplete="username"
                      className="min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-12 pr-4 text-base text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#0284C7] focus:bg-white focus:ring-4 focus:ring-[#0284C7]/10"
                      id="login-identifier"
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder="name@sucolwater.gov"
                      type="text"
                      value={identifier}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="text-sm font-semibold text-[#0F172A]"
                    htmlFor="login-password"
                  >
                    Password
                  </label>
                  <div className="relative mt-2">
                    <FiLock aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      autoComplete="current-password"
                      className="min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-12 pr-12 text-base text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#0284C7] focus:bg-white focus:ring-4 focus:ring-[#0284C7]/10"
                      id="login-password"
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                    />
                    <button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-500 transition hover:text-[#0284C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0284C7]"
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
                </div>

                <button
                  className="min-h-12 w-full rounded-xl bg-[#0284C7] px-5 py-3 text-base font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:ring-offset-2 disabled:opacity-60"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
                  <FiCheckCircle aria-hidden="true" className="h-4 w-4 text-emerald-500" />
                  Account access is routed by the matching database role.
                </div>

                {message && (
                  <p
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#0F172A]"
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
