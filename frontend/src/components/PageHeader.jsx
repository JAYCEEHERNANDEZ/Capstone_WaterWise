/**
 * Compact page-level heading. Keep actions and metrics in sibling sections so
 * the title remains easy to scan on small screens.
 */
export default function PageHeader({ eyebrow, title, description, className = "" }) {
  return (
    <header
      className={`rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-card sm:px-6 ${className}`.trim()}
    >
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-700">
          {eyebrow}
        </p>
      ) : null}
      <h1 className={`${eyebrow ? "mt-1.5" : ""} text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl`}>
        {title}
      </h1>
      {description ? (
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      ) : null}
    </header>
  );
}
