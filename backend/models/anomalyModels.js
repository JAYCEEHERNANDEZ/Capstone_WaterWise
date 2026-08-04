import { supabase } from "../config/supabase.js";

const anomalyCacheError = (message) => {
  const error = new Error(message);
  error.statusCode = 500;
  return error;
};

export async function getStoredAnomaly(cacheKey, sourceSignature) {
  const { data, error } = await supabase
    .from("ai_consumption_cache")
    .select("result_payload")
    .eq("result_type", "anomaly")
    .eq("cache_key", cacheKey)
    .eq("source_signature", sourceSignature)
    .maybeSingle();

  if (error) {
    throw anomalyCacheError(
      `Failed to retrieve stored AI anomaly analysis: ${error.message}`,
    );
  }

  return data?.result_payload ?? null;
}

export async function storeAnomaly({
  anomaly,
  cacheKey,
  period,
  purok = null,
  scope,
  sourceVersion,
}) {
  const generatedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("ai_consumption_cache")
    .upsert(
      {
        result_type: "anomaly",
        result_period: period,
        result_payload: anomaly,
        cache_key: cacheKey,
        generated_at: generatedAt,
        latest_consumption_id: sourceVersion.latestConsumptionId,
        purok,
        scope,
        source_record_count: sourceVersion.recordCount,
        source_signature: sourceVersion.signature,
        updated_at: generatedAt,
      },
      { onConflict: "result_type,cache_key" },
    )
    .select("result_payload")
    .single();

  if (error) {
    throw anomalyCacheError(
      `Failed to store AI anomaly analysis: ${error.message}`,
    );
  }

  return data.result_payload;
}
