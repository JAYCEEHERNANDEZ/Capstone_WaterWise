import ReportGenerator from "./ReportGenerator";

function ReportGenerationPage() {
  return (
    <main className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-600">Operational reporting</p>
        <h1 className="mt-2 text-2xl font-extrabold text-navy-900 sm:text-3xl">
          Report generation
        </h1>

        <p className="text-sm text-slate-500">
          Configure, preview, generate, download, and print system reports.
        </p>
      </header>

      <ReportGenerator />
    </main>
  );
}

export default ReportGenerationPage;
