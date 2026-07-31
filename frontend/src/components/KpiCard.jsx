export default function KpiCard({ title, value, subtitle }) {
  return (
    <article className="ww-glass rounded-2xl p-5">
      <h3 className="text-sm font-bold text-slate-600">{title}</h3>
      <p className="ww-data-value mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      {subtitle && <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>}
    </article>
  );
}
