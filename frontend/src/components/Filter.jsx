import { ChevronDown, ListFilter } from "lucide-react";

const toneClasses = {
  emerald: "focus:border-emerald-500 focus:ring-emerald-100",
  water: "focus:border-water-500 focus:ring-water-100",
};

/** Shared controlled filter for page toolbars and data visualizations. */
export default function Filter({
  ariaLabel = "Filter results",
  className = "",
  dataTestId,
  disabled = false,
  id,
  label,
  name,
  onValueChange,
  options = [],
  tone = "water",
  value = "",
}) {
  const focusClasses = toneClasses[tone] ?? toneClasses.water;

  return (
    <label className={`flex min-w-0 items-center gap-2 ${className}`}>
      <span className={label ? "shrink-0 text-xs font-semibold text-slate-500" : "sr-only"}>
        {label || ariaLabel}
      </span>
      <span className="relative block min-w-0 flex-1">
        <ListFilter
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <select
          aria-label={ariaLabel}
          className={`min-h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm font-bold text-slate-700 outline-none transition-colors focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${focusClasses}`}
          data-testid={dataTestId}
          disabled={disabled}
          id={id}
          name={name}
          onChange={(event) => onValueChange?.(event.target.value)}
          value={value}
        >
          {options.map((option) => (
            <option disabled={option.disabled} key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
      </span>
    </label>
  );
}
