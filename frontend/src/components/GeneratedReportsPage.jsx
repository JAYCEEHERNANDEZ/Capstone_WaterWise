import GeneratedReportsTable from "./GeneratedReportsTable";

function GeneratedReportsPage() {
  return (
    <main className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-600">Report archive</p>
        <h1 className="mt-2 text-2xl font-extrabold text-navy-900 sm:text-3xl">
          Generated reports
        </h1>

        <p className="text-sm text-slate-500">
          View, download, and print previously generated reports.
        </p>
      </header>

      <GeneratedReportsTable />
    </main>
  );
}

export default GeneratedReportsPage;
