import GeneratedReportsTable from "./GeneratedReportsTable";

function GeneratedReportsPage() {
  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          Generated Reports
        </h1>

        <p className="text-sm text-gray-500">
          View, download, and print previously generated reports.
        </p>
      </header>

      <GeneratedReportsTable />
    </main>
  );
}

export default GeneratedReportsPage;
