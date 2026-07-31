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
    label: "Resident",
    eyebrow: "Household account",
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
    <main className="ww-app min-h-screen px-4 py-4 font-sans text-slate-900 sm:px-8 sm:py-8 lg:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center justify-center sm:min-h-[calc(100vh-4rem)]">
        <div className="ww-glass-strong grid w-full overflow-hidden rounded-[28px] lg:grid-cols-[0.94fr_1.06fr]">
          <aside className="ww-page-header relative flex flex-col justify-between rounded-none border-0 p-6 text-white shadow-none sm:p-10 lg:min-h-[650px]">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-950/30"><FiDroplet aria-hidden="true" className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-extrabold tracking-[-0.02em] text-white">WaterWise</p>
                  <p className="text-xs font-medium text-sky-200">Sucol Water System</p>
                </div>
              </div>
              <h1 className="mt-6 max-w-md text-3xl font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-5xl">
                Every drop, clearly understood.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-sky-100 sm:text-base">One secure place for water readings, bills, payments, and barangay updates.</p>
            </div>

            <div className="mt-8 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {roles.map(({ Icon, eyebrow, id, label }) => (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-sm" key={id}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{label}</p>
                    <p className="text-xs text-sky-200">{eyebrow}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="bg-white/55 p-6 sm:p-10 lg:flex lg:items-center lg:p-12">
            <div className="mx-auto max-w-xl">
              <div className="mb-7">
                <p className="ww-eyebrow !text-sky-700">
                  Secure sign in
                </p>
                <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-slate-900 sm:text-4xl">
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
                    className="ww-field py-3 pl-12 pr-4 text-base"
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
                    className="ww-field py-3 pl-12 pr-12 text-base"
                      id="login-password"
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                    />
                    <button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-500 transition hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-600"
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
                  className="ww-primary-button min-h-12 w-full px-5 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
                  <FiCheckCircle aria-hidden="true" className="h-4 w-4 text-emerald-500" />
                  Your account opens only the tools assigned to your role.
                </div>

                {message && (
                  <p
                    className="rounded-xl border border-slate-200 bg-white/75 px-4 py-3 text-sm font-medium text-slate-900"
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
