import { FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router";

export default function RouteAccessError({
  allowedPath = "/login",
  currentRoleLabel = "current role",
  primaryActionLabel = "Open my portal",
  requestedRoleLabel = "this portal",
}) {
  const isSignedIn = currentRoleLabel !== "No authenticated account";

  return (
    <main className="min-h-screen bg-transparent px-4 py-6 font-[Inter,system-ui,sans-serif] text-[#0F172A] sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <div
          className="w-full rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.1)] sm:p-10"
          role="alert"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#DC2626]">
            <FiAlertTriangle aria-hidden="true" className="h-6 w-6" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-[#0284C7]">
            Route access restricted
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#0F172A] sm:text-4xl">
            This page is not available for your role
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            {isSignedIn
              ? `You are signed in as ${currentRoleLabel}, but this route belongs to the ${requestedRoleLabel} workspace. Return to your assigned portal to continue.`
              : `No account is signed in, and this route belongs to the ${requestedRoleLabel} workspace. Sign in with an allowed role to continue.`}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:ring-offset-2"
              to={allowedPath}
            >
              {primaryActionLabel}
              <FiArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>

          </div>
        </div>
      </section>
    </main>
  );
}
