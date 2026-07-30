// backend/models/consumption.model.js

import { supabase } from "../config/supabase.js";

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const formatPurok = (purokNo) => {
  return `Purok ${purokNo}`;
};

// Common consumption query
const fetchConsumptionRecords =
  async () => {
    const { data, error } =
      await supabase
        .from("consumption")
        .select(`
          id,
          consumer_id,
          reading_date,
          previous_reading,
          present_reading,
          consumption,
          consumers!consumption_consumer_id_fkey (
            id,
            full_name,
            purok_no
          )
        `)
        .order("reading_date", {
          ascending: true,
        });

    if (error) {
      throw new Error(
        `Failed to retrieve consumption records: ${error.message}`
      );
    }

    return data ?? [];
  };

// Used by:
// getOverallMonthlyHistory
// getOverallYearlyHistory
// getPerPurokMonthlyHistory
// getPerPurokYearlyHistory
// getAllPuroksMonthlyHistory
// getAllPuroksYearlyHistory
export const getPurokPredictionData =
  async () => {
    const records =
      await fetchConsumptionRecords();

    const groupedRecords =
      new Map();

    records.forEach((record) => {
      const purokNo =
        record.consumers?.purok_no;

      if (
        purokNo === null ||
        purokNo === undefined ||
        !record.reading_date
      ) {
        return;
      }

      const date =
        new Date(
          record.reading_date
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return;
      }

      const year =
        date.getUTCFullYear();

      const monthIndex =
        date.getUTCMonth();

      const month =
        MONTHS[monthIndex];

      if (!month) {
        return;
      }

      const key =
        `${purokNo}-${year}`;

      if (
        !groupedRecords.has(
          key
        )
      ) {
        groupedRecords.set(
          key,
          {
            purok:
              formatPurok(
                purokNo
              ),
            year,
            january: 0,
            february: 0,
            march: 0,
            april: 0,
            may: 0,
            june: 0,
            july: 0,
            august: 0,
            september: 0,
            october: 0,
            november: 0,
            december: 0,
            recordedMonths: [],
          }
        );
      }

      const groupedRecord =
        groupedRecords.get(
          key
        );

      groupedRecord[month] +=
        toNumber(
          record.consumption
        );

      if (
        !groupedRecord.recordedMonths.includes(
          month
        )
      ) {
        groupedRecord.recordedMonths.push(
          month
        );
      }
    });

    return [
      ...groupedRecords.values(),
    ].sort((a, b) => {
      if (
        a.year !== b.year
      ) {
        return (
          a.year - b.year
        );
      }

      return a.purok.localeCompare(
        b.purok,
        undefined,
        {
          numeric: true,
        }
      );
    });
  };

// Used by getConsumptionRanking
export const getPurokConsumptionRanking =
  async () => {
    const records =
      await fetchConsumptionRecords();

    const purokTotals =
      new Map();

    records.forEach(
      (record) => {
        const purokNo =
          record.consumers
            ?.purok_no;

        if (
          purokNo === null ||
          purokNo ===
            undefined
        ) {
          return;
        }

        const purok =
          formatPurok(
            purokNo
          );

        const currentTotal =
          purokTotals.get(
            purok
          ) ?? 0;

        purokTotals.set(
          purok,
          currentTotal +
            toNumber(
              record.consumption
            )
        );
      }
    );

    return [
      ...purokTotals.entries(),
    ].map(
      ([
        purok,
        consumption,
      ]) => ({
        purok,
        consumption:
          toNumber(
            consumption
          ),
      })
    );
  };

const readingError = (message, statusCode = 400) => {
  const error = new TypeError(message);
  error.statusCode = statusCode;
  return error;
};

export const getAllConsumptionReadings = async () => {
  const records = await fetchConsumptionRecords();

  return records
    .map((record) => {
      const consumer = Array.isArray(record.consumers)
        ? record.consumers[0]
        : record.consumers;

      return {
        id: record.id,
        consumer_id: record.consumer_id,
        consumer_name: consumer?.full_name ?? "Unknown consumer",
        purok_no: consumer?.purok_no ?? null,
        reading_date: record.reading_date,
        previous_reading: record.previous_reading,
        present_reading: record.present_reading,
        consumption: record.consumption,
      };
    })
    .sort((a, b) => {
      const dateComparison = String(b.reading_date).localeCompare(
        String(a.reading_date),
      );
      return dateComparison || Number(b.id) - Number(a.id);
    });
};

export const getConsumptionByConsumer = async (consumerId) => {
  const parsedConsumerId = Number(consumerId);
  if (!Number.isInteger(parsedConsumerId) || parsedConsumerId < 1) {
    throw readingError("A valid consumer ID is required.");
  }

  const { data, error } = await supabase
    .from("consumption")
    .select(
      "id, consumer_id, reading_date, previous_reading, present_reading, consumption, created_at, updated_at"
    )
    .eq("consumer_id", parsedConsumerId)
    .order("reading_date", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw readingError(
      `Failed to retrieve consumer consumption: ${error.message}`,
      500
    );
  }

  return data ?? [];
};

export const createConsumptionReading = async ({
  consumerId,
  readingDate,
  previousReading,
  presentReading,
}) => {
  const parsedConsumerId = Number(consumerId);
  const parsedPreviousReading = Number(previousReading);
  const parsedPresentReading = Number(presentReading);

  if (!Number.isInteger(parsedConsumerId) || parsedConsumerId < 1) {
    throw readingError("A valid consumer ID is required.");
  }

  if (
    typeof readingDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(readingDate) ||
    Number.isNaN(Date.parse(`${readingDate}T00:00:00Z`)) ||
    new Date(`${readingDate}T00:00:00Z`).toISOString().slice(0, 10) !==
      readingDate
  ) {
    throw readingError("Reading date must use the YYYY-MM-DD format.");
  }

  if (
    !Number.isFinite(parsedPreviousReading) ||
    !Number.isFinite(parsedPresentReading) ||
    parsedPreviousReading < 0 ||
    parsedPresentReading < 0
  ) {
    throw readingError("Previous and present readings must be non-negative numbers.");
  }

  if (parsedPresentReading < parsedPreviousReading) {
    throw readingError(
      "Present reading cannot be lower than the previous reading."
    );
  }

  const readingMonth = new Date(`${readingDate}T00:00:00Z`);
  const monthStart = new Date(
    Date.UTC(readingMonth.getUTCFullYear(), readingMonth.getUTCMonth(), 1)
  ).toISOString().slice(0, 10);
  const nextMonthStart = new Date(
    Date.UTC(readingMonth.getUTCFullYear(), readingMonth.getUTCMonth() + 1, 1)
  ).toISOString().slice(0, 10);

  const { data: existingReadings, error: existingReadingError } = await supabase
    .from("consumption")
    .select("id")
    .eq("consumer_id", parsedConsumerId)
    .gte("reading_date", monthStart)
    .lt("reading_date", nextMonthStart)
    .limit(1);

  if (existingReadingError) {
    throw readingError(
      `Failed to check the consumer's monthly reading: ${existingReadingError.message}`,
      500
    );
  }

  if (existingReadings.length > 0) {
    throw readingError(
      "This consumer already has a consumption reading for the selected month.",
      409
    );
  }

  const { data, error } = await supabase
    .from("consumption")
    .insert({
      consumer_id: parsedConsumerId,
      reading_date: readingDate,
      previous_reading: parsedPreviousReading,
      present_reading: parsedPresentReading,
    })
    .select(
      "id, consumer_id, reading_date, previous_reading, present_reading, consumption, created_at"
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      throw readingError(
        "This consumer already has a consumption reading for the selected month.",
        409
      );
    }

    if (error.code === "23503") {
      throw readingError("Consumer account not found.", 404);
    }

    throw readingError(`Failed to create meter reading: ${error.message}`, 500);
  }

  return data;
};
