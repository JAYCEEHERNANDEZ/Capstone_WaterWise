let reports = [];

export async function fetchGeneratedReports() {
  return reports;
}

export async function generateReport(payload) {
  const report = {
    ...payload,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    title: payload.title ?? "Generated Report",
  };
  reports = [report, ...reports];
  return report;
}

export async function downloadReportPDF(reportId) {
  const report = reports.find((item) => item.id === reportId);
  return new Blob(
    [JSON.stringify(report ?? { id: reportId }, null, 2)],
    { type: "application/json" },
  );
}
