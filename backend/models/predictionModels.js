import { supabase } from "../config/supabase.js";

const predictionError = (message) => {
  const error = new Error(message);
  error.statusCode = 500;
  return error;
};

export async function getConsumptionSourceVersion() {
  const { data, error, count } = await supabase
    .from("consumption")
    .select("id, updated_at", { count: "exact" })
    .order("id", { ascending: false })
    .limit(1);

  if (error) {
    throw predictionError(
      `Failed to inspect consumption data: ${error.message}`,
    );
  }

  const latestRecord = data?.[0] ?? null;
  const recordCount = count ?? 0;

  return {
    signature: `history-v2:${recordCount}:${latestRecord?.id ?? 0}:${latestRecord?.updated_at ?? "empty"}`,
    recordCount,
    latestConsumptionId: latestRecord?.id ?? null,
  };
}

export async function getStoredPrediction(cacheKey, sourceSignature) {
  const { data, error } = await supabase
    .from("ai_consumption_predictions")
    .select(
      "prediction_payload, source_signature, generated_at, updated_at",
    )
    .eq("cache_key", cacheKey)
    .eq("source_signature", sourceSignature)
    .maybeSingle();

  if (error) {
    throw predictionError(
      `Failed to retrieve stored AI prediction: ${error.message}`,
    );
  }

  return data?.prediction_payload ?? null;
}

export async function storePrediction({
  cacheKey,
  scope,
  period,
  purok = null,
  prediction,
  sourceVersion,
}) {
  const generatedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("ai_consumption_predictions")
    .upsert(
      {
        cache_key: cacheKey,
        scope,
        prediction_period: period,
        purok,
        prediction_payload: prediction,
        source_signature: sourceVersion.signature,
        source_record_count: sourceVersion.recordCount,
        latest_consumption_id: sourceVersion.latestConsumptionId,
        generated_at: generatedAt,
        updated_at: generatedAt,
      },
      { onConflict: "cache_key" },
    )
    .select("prediction_payload")
    .single();

  if (error) {
    throw predictionError(`Failed to store AI prediction: ${error.message}`);
  }

  return data.prediction_payload;
}
