import { useState } from "react";
import { CheckCircle2, Clock3, Eye, Pencil, Trash2 } from "lucide-react";
import MeterReadingRecordModal from "./MeterReadingRecordModal";
import Table from "./Table";

const WATER_RATE_PER_CUBIC_METER = 15;

function ReadingStatus({ status }) {
  const recorded = status === "Recorded";
  const Icon = recorded ? CheckCircle2 : Clock3;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
        recorded
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {status || "Pending"}
    </span>
  );
}

const MeterReadingTable = ({ readings = [], onEdit, onDelete, readOnly = false }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);

  const viewRecord = (reading) => {
    const previousReading = Number(reading.previousReading ?? 0);
    const presentReading = Number(reading.currentReading ?? 0);
    const consumption = Number(reading.consumption ?? presentReading - previousReading);

    setSelectedRecord({
      meterName: reading.consumerName ?? reading.consumerNo ?? "Unknown resident",
      runDate: reading.readingDate ?? "Not available",
      previousReading,
      presentReading,
      baselineBill: Number(
        reading.baselineBill ??
        reading.amountDue ??
        consumption * WATER_RATE_PER_CUBIC_METER,
      ),
      arrears30Days: Number(reading.arrears30Days ?? 0),
      arrears60Days: Number(reading.arrears60Days ?? 0),
      arrears90Days: Number(reading.arrears90Days ?? 0),
    });
  };

  return (
    <>
      <Table
        ariaLabel="Meter readings"
        columns={[
          { key: "account", label: "Account" },
          { key: "resident", label: "Resident" },
          { key: "purok", label: "Purok" },
          { key: "previous", label: "Previous", className: "text-right" },
          { key: "current", label: "Current", className: "text-right" },
          { key: "usage", label: "Usage", className: "text-right" },
          { key: "date", label: "Reading date" },
          { key: "status", label: "Status" },
          { key: "record", label: "Reading details" },
          ...(!readOnly ? [{ key: "actions", label: "Actions", className: "text-right" }] : []),
        ]}
        data={readings}
        emptyDescription="Recorded readings will appear here with their submission status."
        emptyTitle="No meter readings found"
        getRowKey={(reading) => reading.id}
        renderRow={(reading) => (
          <>
                <td className="flex flex-col font-mono text-navy-900 before:mb-1 before:font-sans before:text-xs before:font-semibold before:text-slate-500 before:content-['Account'] md:table-cell md:px-4 md:py-4 md:before:hidden">{reading.consumerNo}</td>
                <td className="col-span-2 row-start-1 flex flex-col font-bold text-navy-900 before:mb-1 before:text-xs before:font-semibold before:text-slate-500 before:content-['Resident'] md:table-cell md:px-4 md:py-4 md:before:hidden">{reading.consumerName}</td>
                <td className="flex flex-col text-slate-600 before:mb-1 before:text-xs before:font-semibold before:text-slate-500 before:content-['Purok'] md:table-cell md:px-4 md:py-4 md:before:hidden">{reading.purok}</td>
                <td className="flex flex-col font-mono tabular-nums before:mb-1 before:font-sans before:text-xs before:font-semibold before:text-slate-500 before:content-['Previous'] md:table-cell md:px-4 md:py-4 md:text-right md:before:hidden">{reading.previousReading} m³</td>
                <td className="flex flex-col font-mono tabular-nums before:mb-1 before:font-sans before:text-xs before:font-semibold before:text-slate-500 before:content-['Current'] md:table-cell md:px-4 md:py-4 md:text-right md:before:hidden">{reading.currentReading} m³</td>
                <td className="flex flex-col font-mono font-bold tabular-nums text-navy-900 before:mb-1 before:font-sans before:text-xs before:font-semibold before:text-slate-500 before:content-['Usage'] md:table-cell md:px-4 md:py-4 md:text-right md:before:hidden">{reading.consumption} m³</td>
                <td className="flex flex-col font-mono text-slate-600 before:mb-1 before:font-sans before:text-xs before:font-semibold before:text-slate-500 before:content-['Date'] md:table-cell md:px-4 md:py-4 md:before:hidden">{reading.readingDate}</td>
                <td className="flex items-end md:table-cell md:px-4 md:py-4"><ReadingStatus status={reading.status} /></td>
                <td className="col-span-2 md:table-cell md:px-4 md:py-4 md:text-center">
                  <button
                    aria-label={`View meter reading record for ${reading.consumerName ?? reading.consumerNo ?? "resident"}`}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-water-200 bg-water-50 px-3 text-sm font-bold text-water-700 transition-colors hover:bg-water-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 focus-visible:ring-offset-2 md:w-auto"
                    onClick={() => viewRecord(reading)}
                    type="button"
                  >
                    <Eye aria-hidden="true" className="h-4 w-4" />
                    View record
                  </button>
                </td>
                {!readOnly && (
                  <td className="col-span-2 md:table-cell md:px-4 md:py-4">
                    <div className="flex gap-2 md:justify-end">
                      <button aria-label={`Edit reading for ${reading.consumerName}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 font-bold text-navy-900 hover:border-water-300 hover:bg-water-50 md:flex-none" onClick={() => onEdit?.(reading)} type="button"><Pencil aria-hidden="true" className="h-4 w-4" />Edit</button>
                      <button aria-label={`Delete reading for ${reading.consumerName}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 font-bold text-red-700 hover:bg-red-50 md:flex-none" onClick={() => onDelete?.(reading.id)} type="button"><Trash2 aria-hidden="true" className="h-4 w-4" />Delete</button>
                    </div>
                  </td>
                )}
          </>
        )}
      />
      <MeterReadingRecordModal
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        recordData={selectedRecord}
      />
    </>
  );
};

export default MeterReadingTable;
