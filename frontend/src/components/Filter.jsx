import { ListFilter } from "lucide-react";
import Dropdown from "./Dropdown";

const toneClasses = {
  emerald: "focus-visible:border-emerald-500 focus-visible:ring-emerald-100",
  water: "focus-visible:border-water-500 focus-visible:ring-water-100",
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
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <span className={label ? "shrink-0 text-xs font-semibold text-slate-500" : "sr-only"}>
        {label || ariaLabel}
      </span>
      <Dropdown
        ariaLabel={ariaLabel}
        className="min-w-0 flex-1"
        dataTestId={dataTestId}
        disabled={disabled}
        icon={ListFilter}
        id={id}
        name={name}
        onValueChange={onValueChange}
        options={options}
        triggerClassName={`border-slate-200 bg-slate-50 text-slate-700 focus-visible:bg-white ${focusClasses}`}
        value={value}
      />
    </div>
  );
}
