import { supabase } from "../config/supabase.js";

const recommendationCacheError = (message) => {
  const error = new Error(message);
  error.statusCode = 500;
  return error;
};

export async function getStoredRecommendation(cacheKey, sourceSignature) {
  const { data, error } = await supabase
    .from("ai_consumption_recommendations")
    .select("recommendation_payload")
    .eq("cache_key", cacheKey)
    .eq("source_signature", sourceSignature)
    .maybeSingle();

  if (error) {
    throw recommendationCacheError(
      `Failed to retrieve stored AI recommendations: ${error.message}`,
    );
  }

  return data?.recommendation_payload ?? null;
}

export async function storeRecommendation({
  cacheKey,
  period,
  purok = null,
  recommendation,
  scope,
  sourceVersion,
}) {
  const generatedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("ai_consumption_recommendations")
    .upsert(
      {
        cache_key: cacheKey,
        generated_at: generatedAt,
        latest_consumption_id: sourceVersion.latestConsumptionId,
        purok,
        recommendation_payload: recommendation,
        recommendation_period: period,
        scope,
        source_record_count: sourceVersion.recordCount,
        source_signature: sourceVersion.signature,
        updated_at: generatedAt,
      },
      { onConflict: "cache_key" },
    )
    .select("recommendation_payload")
    .single();

  if (error) {
    throw recommendationCacheError(
      `Failed to store AI recommendations: ${error.message}`,
    );
  }

  return data.recommendation_payload;
}
