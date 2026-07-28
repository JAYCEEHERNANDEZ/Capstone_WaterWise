// backend/services/anomaly.service.js

import {
  ai,
  GEMINI_MODELS,
  isGeminiConfigured,
} from "../config/gemini.js";

import {
  getOverallMonthlyHistory,
  getOverallYearlyHistory,
  getPerPurokMonthlyHistory,
  getPerPurokYearlyHistory,
  getAllPuroksMonthlyHistory,
  getAllPuroksYearlyHistory,
} from "./consumptionServices.js";
import { getConsumptionSourceVersion } from "../models/predictionModels.js";
import {
  getStoredAnomaly,
  storeAnomaly,
} from "../models/anomalyModels.js";

const pendingAnomalyAnalyses = new Map();

const VALID_STATUSES = [
  "NORMAL",
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const toParagraph = (value) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const clampRiskScore = (value) => {
  return Math.min(
    100,
    Math.max(
      0,
      Math.round(toNumber(value))
    )
  );
};

const normalizeStatus = (status) => {
  const normalizedStatus =
    String(status ?? "NORMAL")
      .trim()
      .toUpperCase();

  return VALID_STATUSES.includes(
    normalizedStatus
  )
    ? normalizedStatus
    : "NORMAL";
};

const createNormalResult = (
  purok = undefined
) => {
  const result = {
    status: "NORMAL",
    hasAnomaly: false,
    riskScore: 0,
    summary:
      "No sufficient historical consumption data was available to detect an abnormal consumption spike.",
    anomalies: [],
  };

  if (purok) {
    result.purok = purok;
  }

  return result;
};

const cleanGeminiResponse = (
  responseText
) => {
  if (
    typeof responseText !==
    "string"
  ) {
    throw new Error(
      "Gemini returned an invalid response."
    );
  }

  return responseText
    .trim()
    .replace(
      /^```(?:json)?\s*/i,
      ""
    )
    .replace(
      /\s*```$/,
      ""
    )
    .trim();
};

const parseGeminiResponse = (
  responseText
) => {
  const cleanedResponse =
    cleanGeminiResponse(
      responseText
    );

  try {
    return JSON.parse(
      cleanedResponse
    );
  } catch {
    throw new Error(
      `Gemini returned invalid JSON: ${cleanedResponse}`
    );
  }
};

const normalizeAnomalyItem = (
  anomaly
) => {
  return {
    period: String(
      anomaly?.period ?? ""
    ),
    actualConsumption:
      Math.max(
        0,
        toNumber(
          anomaly
            ?.actualConsumption
        )
      ),
    expectedConsumption:
      Math.max(
        0,
        toNumber(
          anomaly
            ?.expectedConsumption
        )
      ),
    percentIncrease:
      Math.max(
        0,
        toNumber(
          anomaly
            ?.percentIncrease
        )
      ),
    reason: String(
      anomaly?.reason ?? ""
    ),
  };
};

const normalizeAnomalyResult = (
  result,
  purok = undefined
) => {
  const anomalies =
    Array.isArray(
      result?.anomalies
    )
      ? result.anomalies
          .slice(0, 1)
          .map(
            normalizeAnomalyItem
          )
      : [];

  const status =
    normalizeStatus(
      result?.status
    );

  const hasAnomaly =
    status !== "NORMAL" &&
    anomalies.length > 0;

  const normalizedResult = {
    status:
      hasAnomaly
        ? status
        : "NORMAL",

    hasAnomaly,

    riskScore:
      hasAnomaly
        ? clampRiskScore(
            result?.riskScore
          )
        : 0,

    summary: toParagraph(
      result?.summary ??
        (
          hasAnomaly
            ? "An abnormal water consumption spike was detected."
            : "No abnormal water consumption spike was detected."
        )
    ),

    anomalies:
      hasAnomaly
        ? anomalies
        : [],
  };

  if (purok) {
    normalizedResult.purok =
      purok;
  }

  return normalizedResult;
};

const hasHistoricalData = (
  historical
) => {
  return (
    Array.isArray(historical) &&
    historical.length > 0
  );
};

// Gemini helper
const generateAnomalyAnalysis =
  async (prompt) => {
    if (
      !isGeminiConfigured()
    ) {
      throw new Error(
        "Gemini API key is not configured."
      );
    }

    let lastError = null;

    for (
      const model of
      GEMINI_MODELS
    ) {
      try {
        console.log(
          `Trying Gemini model: ${model}`
        );

        const response =
          await ai.models
            .generateContent({
              model,
              contents: prompt,
            });

        const responseText =
          typeof response.text ===
          "function"
            ? response.text()
            : response.text;

        const parsedResponse =
          parseGeminiResponse(
            responseText
          );

        console.log(
          `Gemini anomaly analysis succeeded using: ${model}`
        );

        return parsedResponse;
      } catch (error) {
        console.warn(
          `Gemini model ${model} failed:`,
          error.message
        );

        lastError = error;
      }
    }

    throw (
      lastError ??
      new Error(
        "All Gemini models failed."
      )
    );
  };

// ==========================================
// OVERALL MONTHLY ANOMALY
// ==========================================

const generateOverallMonthlyAnomalyUncached =
  async () => {
    const historical =
      await getOverallMonthlyHistory();

    if (
      !hasHistoricalData(
        historical
      )
    ) {
      return createNormalResult();
    }

    const prompt = `
You are an AI water consumption anomaly detector.

Analyze the supplied overall monthly water consumption history.

Historical data:
${JSON.stringify(historical)}

Responsibilities:
- Detect only abnormal increases or consumption spikes.
- Ignore normal fluctuations.
- Compare recent consumption against earlier consumption.
- Do not report decreases as spike anomalies.
- Classify the anomaly severity accurately.

Severity levels:
NORMAL
LOW
MEDIUM
HIGH
CRITICAL

Rules:
- If no abnormal spike exists, use status "NORMAL".
- If status is "NORMAL", hasAnomaly must be false.
- If status is "NORMAL", riskScore must be 0.
- If status is "NORMAL", anomalies must be an empty array.
- riskScore must be between 0 and 100.
- actualConsumption and expectedConsumption must be non-negative numbers.
- percentIncrease must be a non-negative number.
- Return only valid JSON.
- Do not use Markdown code fences.
- Do not include text outside the JSON.

Expected format:

{
  "status": "NORMAL",
  "hasAnomaly": false,
  "riskScore": 0,
  "summary": "",
  "anomalies": [
    {
      "period": "",
      "actualConsumption": 0,
      "expectedConsumption": 0,
      "percentIncrease": 0,
      "reason": ""
    }
  ]
}
`;

    const result =
      await generateAnomalyAnalysis(
        prompt
      );

    return normalizeAnomalyResult(
      result
    );
  };

// ==========================================
// OVERALL YEARLY ANOMALY
// ==========================================

const generateOverallYearlyAnomalyUncached =
  async () => {
    const historical =
      await getOverallYearlyHistory();

    if (
      !hasHistoricalData(
        historical
      )
    ) {
      return createNormalResult();
    }

    const prompt = `
You are an AI water consumption anomaly detector.

Analyze the supplied overall yearly water consumption history.

Historical data:
${JSON.stringify(historical)}

Responsibilities:
- Detect only abnormal increases or consumption spikes.
- Ignore normal fluctuations.
- Compare the latest yearly consumption against earlier years.
- Do not report decreases as spike anomalies.
- Classify the anomaly severity accurately.

Severity levels:
NORMAL
LOW
MEDIUM
HIGH
CRITICAL

Rules:
- If no abnormal spike exists, use status "NORMAL".
- If status is "NORMAL", hasAnomaly must be false.
- If status is "NORMAL", riskScore must be 0.
- If status is "NORMAL", anomalies must be an empty array.
- riskScore must be between 0 and 100.
- Return only valid JSON.
- Do not use Markdown code fences.
- Do not include explanations outside the JSON.

Expected format:

{
  "status": "NORMAL",
  "hasAnomaly": false,
  "riskScore": 0,
  "summary": "",
  "anomalies": [
    {
      "period": "",
      "actualConsumption": 0,
      "expectedConsumption": 0,
      "percentIncrease": 0,
      "reason": ""
    }
  ]
}
`;

    const result =
      await generateAnomalyAnalysis(
        prompt
      );

    return normalizeAnomalyResult(
      result
    );
  };

// ==========================================
// PER-PUROK MONTHLY ANOMALY
// ==========================================

const generatePerPurokMonthlyAnomalyUncached =
  async (purok) => {
    if (!purok) {
      throw new Error(
        "Purok is required."
      );
    }

    const historical =
      await getPerPurokMonthlyHistory(
        purok
      );

    if (
      !hasHistoricalData(
        historical
      )
    ) {
      return createNormalResult(
        purok
      );
    }

    const prompt = `
You are an AI water consumption anomaly detector.

Purok:
${purok}

Analyze the supplied monthly water consumption history for this purok.

Historical data:
${JSON.stringify(historical)}

Responsibilities:
- Detect only abnormal increases or consumption spikes.
- Ignore normal fluctuations.
- Compare recent consumption against earlier consumption.
- Do not report decreases as spike anomalies.
- Classify the anomaly severity accurately.

Severity levels:
NORMAL
LOW
MEDIUM
HIGH
CRITICAL

Rules:
- Preserve the supplied purok name exactly.
- If no abnormal spike exists, use status "NORMAL".
- If status is "NORMAL", hasAnomaly must be false.
- If status is "NORMAL", riskScore must be 0.
- If status is "NORMAL", anomalies must be an empty array.
- riskScore must be between 0 and 100.
- Return only valid JSON.
- Do not use Markdown code fences.
- Do not include explanations outside the JSON.

Expected format:

{
  "purok": "${purok}",
  "status": "NORMAL",
  "hasAnomaly": false,
  "riskScore": 0,
  "summary": "",
  "anomalies": [
    {
      "period": "",
      "actualConsumption": 0,
      "expectedConsumption": 0,
      "percentIncrease": 0,
      "reason": ""
    }
  ]
}
`;

    const result =
      await generateAnomalyAnalysis(
        prompt
      );

    return normalizeAnomalyResult(
      result,
      purok
    );
  };

// ==========================================
// PER-PUROK YEARLY ANOMALY
// ==========================================

const generatePerPurokYearlyAnomalyUncached =
  async (purok) => {
    if (!purok) {
      throw new Error(
        "Purok is required."
      );
    }

    const historical =
      await getPerPurokYearlyHistory(
        purok
      );

    if (
      !hasHistoricalData(
        historical
      )
    ) {
      return createNormalResult(
        purok
      );
    }

    const prompt = `
You are an AI water consumption anomaly detector.

Purok:
${purok}

Analyze the supplied yearly water consumption history for this purok.

Historical data:
${JSON.stringify(historical)}

Responsibilities:
- Detect only abnormal increases or consumption spikes.
- Ignore normal fluctuations.
- Compare the latest yearly consumption against earlier years.
- Do not report decreases as spike anomalies.
- Classify the anomaly severity accurately.

Severity levels:
NORMAL
LOW
MEDIUM
HIGH
CRITICAL

Rules:
- Preserve the supplied purok name exactly.
- If no abnormal spike exists, use status "NORMAL".
- If status is "NORMAL", hasAnomaly must be false.
- If status is "NORMAL", riskScore must be 0.
- If status is "NORMAL", anomalies must be an empty array.
- riskScore must be between 0 and 100.
- Return only valid JSON.
- Do not use Markdown code fences.
- Do not include explanations outside the JSON.

Expected format:

{
  "purok": "${purok}",
  "status": "NORMAL",
  "hasAnomaly": false,
  "riskScore": 0,
  "summary": "",
  "anomalies": [
    {
      "period": "",
      "actualConsumption": 0,
      "expectedConsumption": 0,
      "percentIncrease": 0,
      "reason": ""
    }
  ]
}
`;

    const result =
      await generateAnomalyAnalysis(
        prompt
      );

    return normalizeAnomalyResult(
      result,
      purok
    );
  };

// ==========================================
// ALL-PUROKS MONTHLY ANOMALY
// ==========================================

const generateAllPuroksMonthlyAnomalyUncached =
  async () => {
    const historical =
      await getAllPuroksMonthlyHistory();

    if (
      !hasHistoricalData(
        historical
      )
    ) {
      return [];
    }

    const expectedPuroks =
      historical
        .map(
          (item) =>
            item.purok
        )
        .filter(Boolean);

    const prompt = `
You are an AI water consumption anomaly detector.

Analyze the supplied monthly water consumption history for every purok.

Historical data:
${JSON.stringify(historical)}

Responsibilities:
- Detect only abnormal increases or consumption spikes.
- Ignore normal fluctuations.
- Compare recent consumption against earlier consumption.
- Do not report decreases as spike anomalies.
- Classify anomaly severity separately for every purok.

Severity levels:
NORMAL
LOW
MEDIUM
HIGH
CRITICAL

Rules:
- Return exactly one result for every supplied purok.
- Preserve every supplied purok name exactly.
- If a purok has no abnormal spike, use status "NORMAL".
- If status is "NORMAL", hasAnomaly must be false.
- If status is "NORMAL", riskScore must be 0.
- If status is "NORMAL", anomalies must be an empty array.
- riskScore must be between 0 and 100.
- Return only a valid JSON array.
- Do not use Markdown code fences.
- Do not include explanations outside the JSON.

Expected format:

[
  {
    "purok": "Purok 1",
    "status": "NORMAL",
    "hasAnomaly": false,
    "riskScore": 0,
    "summary": "",
    "anomalies": [
      {
        "period": "",
        "actualConsumption": 0,
        "expectedConsumption": 0,
        "percentIncrease": 0,
        "reason": ""
      }
    ]
  }
]
`;

    const result =
      await generateAnomalyAnalysis(
        prompt
      );

    if (!Array.isArray(result)) {
      throw new Error(
        "Gemini monthly anomaly analysis must return an array."
      );
    }

    const resultMap =
      new Map(
        result.map((item) => [
          item.purok,
          item,
        ])
      );

    return expectedPuroks.map(
      (purok) => {
        const anomalyResult =
          resultMap.get(purok);

        if (!anomalyResult) {
          return createNormalResult(
            purok
          );
        }

        return normalizeAnomalyResult(
          anomalyResult,
          purok
        );
      }
    );
  };

// ==========================================
// ALL-PUROKS YEARLY ANOMALY
// ==========================================

const generateAllPuroksYearlyAnomalyUncached =
  async () => {
    const historical =
      await getAllPuroksYearlyHistory();

    if (
      !hasHistoricalData(
        historical
      )
    ) {
      return [];
    }

    const expectedPuroks =
      historical
        .map(
          (item) =>
            item.purok
        )
        .filter(Boolean);

    const prompt = `
You are an AI water consumption anomaly detector.

Analyze the supplied yearly water consumption history for every purok.

Historical data:
${JSON.stringify(historical)}

Responsibilities:
- Detect only abnormal increases or consumption spikes.
- Ignore normal fluctuations.
- Compare the latest yearly consumption against earlier years.
- Do not report decreases as spike anomalies.
- Classify anomaly severity separately for every purok.

Severity levels:
NORMAL
LOW
MEDIUM
HIGH
CRITICAL

Rules:
- Return exactly one result for every supplied purok.
- Preserve every supplied purok name exactly.
- If a purok has no abnormal spike, use status "NORMAL".
- If status is "NORMAL", hasAnomaly must be false.
- If status is "NORMAL", riskScore must be 0.
- If status is "NORMAL", anomalies must be an empty array.
- riskScore must be between 0 and 100.
- Return only a valid JSON array.
- Do not use Markdown code fences.
- Do not include explanations outside the JSON.

Expected format:

[
  {
    "purok": "Purok 1",
    "status": "NORMAL",
    "hasAnomaly": false,
    "riskScore": 0,
    "summary": "",
    "anomalies": [
      {
        "period": "",
        "actualConsumption": 0,
        "expectedConsumption": 0,
        "percentIncrease": 0,
        "reason": ""
      }
    ]
  }
]
`;

    const result =
      await generateAnomalyAnalysis(
        prompt
      );

    if (!Array.isArray(result)) {
      throw new Error(
        "Gemini yearly anomaly analysis must return an array."
      );
    }

    const resultMap =
      new Map(
        result.map((item) => [
          item.purok,
          item,
        ])
      );

    return expectedPuroks.map(
      (purok) => {
        const anomalyResult =
          resultMap.get(purok);

        if (!anomalyResult) {
          return createNormalResult(
            purok
          );
        }

        return normalizeAnomalyResult(
          anomalyResult,
          purok
        );
      }
    );
  };

const getOrGenerateAnomaly = async (
  { cacheKey, period, purok = null, scope },
  generator,
) => {
  const sourceVersion = await getConsumptionSourceVersion();
  const storedAnomaly = await getStoredAnomaly(
    cacheKey,
    sourceVersion.signature,
  );

  if (storedAnomaly !== null) {
    return Array.isArray(storedAnomaly)
      ? storedAnomaly.map((item) =>
          normalizeAnomalyResult(item, item?.purok)
        )
      : normalizeAnomalyResult(
          storedAnomaly,
          storedAnomaly?.purok,
        );
  }

  const pendingKey = `${cacheKey}:${sourceVersion.signature}`;
  if (pendingAnomalyAnalyses.has(pendingKey)) {
    return pendingAnomalyAnalyses.get(pendingKey);
  }

  const analysisTask = (async () => {
    const anomaly = await generator();
    return storeAnomaly({
      anomaly,
      cacheKey,
      period,
      purok,
      scope,
      sourceVersion,
    });
  })();

  pendingAnomalyAnalyses.set(
    pendingKey,
    analysisTask,
  );

  try {
    return await analysisTask;
  } finally {
    pendingAnomalyAnalyses.delete(
      pendingKey,
    );
  }
};

export const generateOverallMonthlyAnomaly = async () =>
  getOrGenerateAnomaly(
    {
      cacheKey: "overall:monthly",
      period: "monthly",
      scope: "overall",
    },
    generateOverallMonthlyAnomalyUncached,
  );

export const generateOverallYearlyAnomaly = async () =>
  getOrGenerateAnomaly(
    {
      cacheKey: "overall:yearly",
      period: "yearly",
      scope: "overall",
    },
    generateOverallYearlyAnomalyUncached,
  );

export const generatePerPurokMonthlyAnomaly = async (purok) =>
  getOrGenerateAnomaly(
    {
      cacheKey: `purok:monthly:${encodeURIComponent(purok)}`,
      period: "monthly",
      purok,
      scope: "purok",
    },
    () => generatePerPurokMonthlyAnomalyUncached(purok),
  );

export const generatePerPurokYearlyAnomaly = async (purok) =>
  getOrGenerateAnomaly(
    {
      cacheKey: `purok:yearly:${encodeURIComponent(purok)}`,
      period: "yearly",
      purok,
      scope: "purok",
    },
    () => generatePerPurokYearlyAnomalyUncached(purok),
  );

export const generateAllPuroksMonthlyAnomaly = async () =>
  getOrGenerateAnomaly(
    {
      cacheKey: "all-puroks:monthly",
      period: "monthly",
      scope: "all-puroks",
    },
    generateAllPuroksMonthlyAnomalyUncached,
  );

export const generateAllPuroksYearlyAnomaly = async () =>
  getOrGenerateAnomaly(
    {
      cacheKey: "all-puroks:yearly",
      period: "yearly",
      scope: "all-puroks",
    },
    generateAllPuroksYearlyAnomalyUncached,
  );

// ==========================================
// GENERATE ALL ANOMALIES
// ==========================================

export const generateAllAnomaliesService =
  async () => {
    const [
      overallMonthly,
      overallYearly,
      allPuroksMonthly,
      allPuroksYearly,
    ] = await Promise.all([
      generateOverallMonthlyAnomaly(),
      generateOverallYearlyAnomaly(),
      generateAllPuroksMonthlyAnomaly(),
      generateAllPuroksYearlyAnomaly(),
    ]);

    return {
      overallMonthly,
      overallYearly,
      allPuroksMonthly,
      allPuroksYearly,
    };
  };
