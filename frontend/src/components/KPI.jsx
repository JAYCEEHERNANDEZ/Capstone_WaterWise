import { MoreHorizontal, Minus, TrendingDown, TrendingUp } from "lucide-react";

const trendStyles = {
  positive: "bg-emerald-50 text-emerald-700",
  negative: "bg-red-50 text-red-700",
  neutral: "bg-slate-100 text-slate-600",
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const descriptionHighlightPattern = /((?:[+-]?₱\s*)?(?:\d{1,2}:\d{2}\s?(?:AM|PM)?|[+-]?\d[\d,]*(?:\.\d+)?)(?:\s?(?:%|m³|m3|liters?|L))?|\b(?:increase(?:d|s)?|increasing|higher|grew|growth|gained|decrease(?:d|s)?|decreasing|lower|declined?|dropped?)\b)/gi;

const positiveTrendPattern = /\b(increase(?:d|s)?|increasing|higher|more|above|grew|growth|gained|up)\b/i;
const negativeTrendPattern = /\b(decrease(?:d|s)?|decreasing|lower|less|below|declined?|dropped?|down)\b/i;

function getDescriptionNumberTone(description, number, index) {
  const context = description.slice(Math.max(0, index - 28), index + number.length + 28);
  if (number.trim().startsWith("+") || positiveTrendPattern.test(number) || positiveTrendPattern.test(context)) return "positive";
  if (number.trim().startsWith("-") || negativeTrendPattern.test(number) || negativeTrendPattern.test(context)) return "negative";
  return "neutral";
}

function DescriptionText({ children }) {
  if (typeof children !== "string") return children;

  const matches = [...children.matchAll(descriptionHighlightPattern)];
  if (!matches.length) return children;

  const parts = [];
  let cursor = 0;
  matches.forEach((match) => {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(children.slice(cursor, index));
    const tone = getDescriptionNumberTone(children, match[0], index);
    parts.push(
      <span
        className={`mx-0.5 inline-flex rounded-full border px-2 py-0.5 font-mono font-bold tabular-nums ${
          tone === "positive"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : tone === "negative"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-water-200 bg-water-50 text-water-800"
        }`}
        key={`${index}-${match[0]}`}
      >
        {match[0]}
      </span>,
    );
    cursor = index + match[0].length;
  });
  if (cursor < children.length) parts.push(children.slice(cursor));
  return parts;
}

/** A uniform metric card for new page summaries. Existing KPI components stay independent. */
export default function KPI({
  title,
  value,
  unit,
  icon: Icon,
  description,
  trend,
  trendDirection = "neutral",
  trendTone = "neutral",
  menuLabel,
  onMenu,
  className = "",
}) {
  const TrendIcon = trendIcons[trendDirection] ?? Minus;
  const resolvedTrendTone = trendTone === "neutral"
    ? trendDirection === "up"
      ? "positive"
      : trendDirection === "down"
        ? "negative"
        : "neutral"
    : trendTone;

  return (
    <article
      className={`min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-card ${className}`.trim()}
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-water-50 text-water-700">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
        ) : null}
        <h2 className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700 sm:text-base">
          {title}
        </h2>
        {onMenu ? (
          <button
            aria-label={menuLabel ?? `More options for ${title}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-500 focus-visible:ring-offset-2"
            onClick={onMenu}
            type="button"
          >
            <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <p className="mt-5 font-mono text-3xl font-extrabold tracking-tight text-navy-900 tabular-nums">
        {value}
        {unit ? <span className="ml-1.5 text-sm font-bold text-slate-500">{unit}</span> : null}
      </p>

      {trend ? (
        <div className="mt-3 flex min-w-0 items-center gap-2 text-xs">
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 font-bold ${trendStyles[resolvedTrendTone] ?? trendStyles.neutral}`}
          >
            <TrendIcon aria-hidden="true" className="h-3.5 w-3.5" />
            {trend}
          </span>
          {description ? <span className="min-w-0 text-slate-500"><DescriptionText>{description}</DescriptionText></span> : null}
        </div>
      ) : description ? (
        <p className="mt-3 text-xs leading-5 text-slate-500"><DescriptionText>{description}</DescriptionText></p>
      ) : null}
    </article>
  );
}
