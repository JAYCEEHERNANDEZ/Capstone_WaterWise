import PDFDocument from "pdfkit";
import { supabase } from "../config/supabase.js";
import { insertGeneratedReport } from "../models/reportModels.js";

const REPORT_TYPES = {
  consumption: { label: "Consumption", sections: ["summary", "consumption", "analytics"] },
  billing: { label: "Billing", sections: ["summary", "billing"] },
  residents: { label: "Residents", sections: ["summary", "residents"] },
  analytics: { label: "Analytics", sections: ["summary", "analytics", "consumption"] },
};

const serviceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseDate = (value, label) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(Date.parse(`${value}T00:00:00Z`)) ||
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value
  ) {
    throw serviceError(`${label} must use the YYYY-MM-DD format.`);
  }
  return value;
};

const validateRequest = ({ type, startDate, endDate, sections }) => {
  const template = REPORT_TYPES[type];
  if (!template) throw serviceError("Select a supported report type.");

  const start = parseDate(startDate, "Start date");
  const end = parseDate(endDate, "End date");
  if (end < start) throw serviceError("The end date must be on or after the start date.");
  const periodDays = (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000;
  if (periodDays > 366) throw serviceError("A report period cannot exceed one year.");

  const selectedSections = [...new Set(Array.isArray(sections) ? sections : [])];
  if (selectedSections.length === 0) throw serviceError("Select at least one report section.");
  if (selectedSections.some((section) => !template.sections.includes(section))) {
    throw serviceError(`One or more sections are not available for ${template.label} reports.`);
  }
  return { endDate: end, sections: selectedSections, startDate: start, template, type };
};

const number = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
const round = (value) => Number(number(value).toFixed(2));
const purok = (value) => (value == null ? "Unassigned" : `Purok ${value}`);

async function consumptionRecords(startDate, endDate) {
  const { data, error } = await supabase
    .from("consumption")
    .select(`
      id, consumer_id, reading_date, previous_reading, present_reading, consumption,
      consumers!consumption_consumer_id_fkey (id, username, full_name, purok_no)
    `)
    .gte("reading_date", startDate)
    .lte("reading_date", endDate)
    .order("reading_date", { ascending: true });
  if (error) throw serviceError(`Failed to retrieve consumption data: ${error.message}`, 500);
  return (data ?? []).map((record) => ({
    id: record.id,
    consumerId: record.consumer_id,
    consumerName: record.consumers?.full_name ?? "Unknown resident",
    username: record.consumers?.username ?? "Unavailable",
    purok: purok(record.consumers?.purok_no),
    readingDate: record.reading_date,
    previousReading: number(record.previous_reading),
    currentReading: number(record.present_reading),
    consumption: number(record.consumption),
  }));
}

async function billingRecords(startDate, endDate) {
  const { data, error } = await supabase
    .from("billing")
    .select(`
      id, billing_date, due_date, total_bill, remaining_balance, status,
      consumers!billing_user_id_fkey (id, username, full_name, purok_no)
    `)
    .gte("billing_date", startDate)
    .lte("billing_date", endDate)
    .order("billing_date", { ascending: true });
  if (error) throw serviceError(`Failed to retrieve billing data: ${error.message}`, 500);
  return (data ?? []).map((record) => ({
    id: record.id,
    billingDate: record.billing_date,
    consumerName: record.consumers?.full_name ?? "Unknown resident",
    dueDate: record.due_date,
    purok: purok(record.consumers?.purok_no),
    remainingBalance: number(record.remaining_balance),
    status: record.status ?? "Unknown",
    totalBill: number(record.total_bill),
    username: record.consumers?.username ?? "Unavailable",
  }));
}

async function residentRecords(startDate, endDate) {
  const { data, error } = await supabase
    .from("consumers")
    .select("id, username, full_name, email, purok_no, status, created_at")
    .gte("created_at", `${startDate}T00:00:00Z`)
    .lte("created_at", `${endDate}T23:59:59.999Z`)
    .order("created_at", { ascending: true });
  if (error) throw serviceError(`Failed to retrieve resident data: ${error.message}`, 500);
  return (data ?? []).map((record) => ({
    id: record.id,
    createdAt: record.created_at,
    email: record.email,
    name: record.full_name,
    purok: purok(record.purok_no),
    status: record.status ?? "inactive",
    username: record.username,
  }));
}

const consumptionSummary = (records) => {
  const total = records.reduce((sum, record) => sum + record.consumption, 0);
  return {
    totalConsumption: round(total),
    averageConsumption: round(records.length ? total / records.length : 0),
    highestConsumption: round(Math.max(0, ...records.map((record) => record.consumption))),
    uniqueResidents: new Set(records.map((record) => record.consumerId)).size,
  };
};

const consumptionByPurok = (records) => {
  const totals = new Map();
  records.forEach((record) => totals.set(record.purok, number(totals.get(record.purok)) + record.consumption));
  return [...totals.entries()]
    .map(([name, totalConsumption]) => ({ name, totalConsumption: round(totalConsumption) }))
    .sort((first, second) => second.totalConsumption - first.totalConsumption);
};

async function buildSnapshot(request) {
  const validated = validateRequest(request);
  let records;
  let summary;
  let analytics = [];

  if (["consumption", "analytics"].includes(validated.type)) {
    records = await consumptionRecords(validated.startDate, validated.endDate);
    summary = consumptionSummary(records);
    analytics = consumptionByPurok(records);
  } else if (validated.type === "billing") {
    records = await billingRecords(validated.startDate, validated.endDate);
    summary = {
      totalBilled: round(records.reduce((sum, record) => sum + record.totalBill, 0)),
      collectedAmount: round(records.reduce((sum, record) => sum + record.totalBill - record.remainingBalance, 0)),
      outstandingBalance: round(records.reduce((sum, record) => sum + record.remainingBalance, 0)),
      paidBills: records.filter((record) => record.status === "Paid").length,
    };
  } else {
    records = await residentRecords(validated.startDate, validated.endDate);
    summary = {
      activeResidents: records.filter((record) => record.status?.toLowerCase() === "active").length,
      inactiveResidents: records.filter((record) => record.status?.toLowerCase() !== "active").length,
      puroksRepresented: new Set(records.map((record) => record.purok)).size,
    };
  }
  return { ...validated, analytics, generatedAt: new Date().toISOString(), recordCount: records.length, records, summary };
}

export async function buildReportPreview(request) {
  const snapshot = await buildSnapshot(request);
  return {
    analytics: snapshot.analytics,
    endDate: snapshot.endDate,
    recordCount: snapshot.recordCount,
    sections: snapshot.sections,
    startDate: snapshot.startDate,
    summary: snapshot.summary,
    title: `${snapshot.template.label} report preview`,
    type: snapshot.type,
  };
}

export async function createPersistentReport(request, adminId) {
  const snapshot = await buildSnapshot(request);
  const title = `${snapshot.template.label} Report - ${snapshot.startDate} to ${snapshot.endDate}`;
  return insertGeneratedReport({
    end_date: snapshot.endDate,
    generated_by: adminId,
    record_count: snapshot.recordCount,
    report_data: {
      analytics: snapshot.analytics,
      generatedAt: snapshot.generatedAt,
      records: snapshot.records,
      summary: snapshot.summary,
    },
    report_type: snapshot.type,
    sections: snapshot.sections,
    start_date: snapshot.startDate,
    status: "Ready",
    title,
  });
}

const currency = (value) => `PHP ${number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const metricLabel = (key) => key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
const dateOnly = (value) => String(value ?? "").slice(0, 10) || "Unavailable";

export function renderReportPdf(report) {
  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({ bufferPages: true, margin: 44, size: "A4" });
    const chunks = [];
    pdf.on("data", (chunk) => chunks.push(chunk));
    pdf.on("error", reject);
    pdf.on("end", () => resolve(Buffer.concat(chunks)));

    const data = report.report_data ?? {};
    const sections = report.sections ?? [];
    const ensureSpace = (height = 42) => {
      if (pdf.y + height > 760) pdf.addPage();
    };
    const heading = (title) => {
      ensureSpace(54);
      pdf.moveDown(0.7).font("Helvetica-Bold").fontSize(14).fillColor("#0f172a").text(title);
      pdf.moveDown(0.25).strokeColor("#bae6fd").lineWidth(1).moveTo(44, pdf.y).lineTo(551, pdf.y).stroke();
      pdf.moveDown(0.5);
    };
    const row = (text) => {
      ensureSpace(32);
      pdf.font("Helvetica").fontSize(8.5).fillColor("#334155").text(text, { lineGap: 2 });
      pdf.moveDown(0.35);
    };

    pdf.font("Helvetica-Bold").fontSize(10).fillColor("#0284c7").text("WATERWISE | SUCOL WATER SYSTEM");
    pdf.moveDown(0.45).fontSize(21).fillColor("#0f172a").text(report.title);
    pdf.moveDown(0.35).font("Helvetica").fontSize(9.5).fillColor("#64748b");
    pdf.text(`Reporting period: ${report.start_date} to ${report.end_date}`);
    pdf.text(`Generated: ${dateOnly(report.created_at)} | Records: ${report.record_count} | Status: ${report.status}`);

    if (sections.includes("summary")) {
      heading("Executive summary");
      Object.entries(data.summary ?? {}).forEach(([key, value]) => {
        const formatted = /amount|balance|billed|collected/i.test(key)
          ? currency(value)
          : /consumption/i.test(key)
            ? `${number(value).toLocaleString("en-US")} m3`
            : number(value).toLocaleString("en-US");
        row(`${metricLabel(key)}: ${formatted}`);
      });
    }

    if (sections.includes("analytics")) {
      heading("Consumption by purok");
      if (!(data.analytics ?? []).length) row("No analytics data is available for this period.");
      (data.analytics ?? []).forEach((item, index) => row(`${index + 1}. ${item.name} - ${number(item.totalConsumption).toLocaleString("en-US")} m3`));
    }

    const recordSection = report.report_type === "billing" ? "billing" : report.report_type === "residents" ? "residents" : "consumption";
    if (sections.includes(recordSection)) {
      heading(`${REPORT_TYPES[report.report_type]?.label ?? "Report"} records`);
      if (!(data.records ?? []).length) row("No records were found for this reporting period.");
      (data.records ?? []).forEach((record, index) => {
        if (report.report_type === "billing") {
          row(`${index + 1}. ${record.billingDate} | ${record.consumerName} | ${record.purok} | ${currency(record.totalBill)} | Balance ${currency(record.remainingBalance)} | ${record.status}`);
        } else if (report.report_type === "residents") {
          row(`${index + 1}. ${record.name} | ${record.username} | ${record.purok} | ${record.status} | Registered ${dateOnly(record.createdAt)}`);
        } else {
          row(`${index + 1}. ${record.readingDate} | ${record.consumerName} | ${record.purok} | ${record.previousReading} to ${record.currentReading} | ${record.consumption} m3`);
        }
      });
    }

    const pageRange = pdf.bufferedPageRange();
    for (let page = pageRange.start; page < pageRange.start + pageRange.count; page += 1) {
      pdf.switchToPage(page);
      pdf.font("Helvetica").fontSize(8).fillColor("#94a3b8").text(
        `Official WaterWise administrative report | Page ${page + 1} of ${pageRange.count}`,
        44,
        792,
        { align: "center", width: 507 },
      );
    }
    pdf.end();
  });
}
