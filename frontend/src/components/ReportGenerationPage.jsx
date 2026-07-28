import ReportGenerator from "./ReportGenerator";

function ReportGenerationPage() {
  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          Report Generation
        </h1>

        <p className="text-sm text-gray-500">
          Configure, preview, generate, download, and print system reports.
        </p>
      </header>

      <ReportGenerator />
    </main>
  );
}

export default ReportGenerationPage;
