import { useCallback, useEffect, useState } from "react";

import { AlertCircle, MapPinned, RefreshCw } from "lucide-react";

import {
  fetchAllPuroksMonthlyPrediction,
  fetchAllPuroksYearlyPrediction,
} from "../services/consumptionAPI";

function AdminPerPurokConsumptionCard() {
  const [period, setPeriod] = useState("Monthly");

  const [puroks, setPuroks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadPredictions = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response =
        period === "Monthly"
          ? await fetchAllPuroksMonthlyPrediction()
          : await fetchAllPuroksYearlyPrediction();

      const data = response?.data ?? response;

      const predictions =
        data?.predictions ?? data?.puroks ?? data?.data ?? data ?? [];

      setPuroks(Array.isArray(predictions) ? predictions : []);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load purok predictions.",
      );

      setPuroks([]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    const fetchData = async () => {
      await loadPredictions();
    };

    fetchData();
  }, [loadPredictions]);

  const defaultPuroks = [
    "Purok 1",

    "Purok 2",

    "Purok 3",

    "Purok 4",

    "Purok 5",

    "Purok 6",
  ];

  return (
    <div
    data-testid="purok-consumption-card"
      className="
group
relative
overflow-hidden
rounded-2xl
border
border-slate-200
bg-white
p-5
shadow-sm
transition-all
duration-300
hover:-translate-y-1
hover:border-emerald-200
hover:shadow-md
"
    >
      <div
        className="
absolute
-right-10
-top-10
h-28
w-28
rounded-full
bg-emerald-100/80
blur-2xl
"
      />

      <div
        className="
relative
"
      >
        {/* HEADER */}

        <div
          className="
flex
items-start
justify-between
"
        >
          <div>
            <p
              className="
text-sm
font-bold
uppercase
tracking-[0.14em]
text-slate-700
"
            >
              {period === "Monthly"
                ? "Per Purok Monthly Predicted Consumption"
                : "Per Purok Yearly Predicted Consumption"}
            </p>

            <p
              className="
mt-1
text-xs
text-slate-500
"
            >
              Forecasted water usage for each purok
            </p>

            {/* FILTER */}

            <div
              className="
mt-4
flex
gap-2
"
            >
              <button
                onClick={() => setPeriod("Monthly")}
                className={`

rounded-lg
px-4
py-2
text-xs
font-semibold

${
  period === "Monthly"
    ? "bg-emerald-600 text-white"
    : "bg-slate-100 text-slate-700"
}

`}
              >
                Monthly
              </button>

              <button
                onClick={() => setPeriod("Yearly")}
                className={`

rounded-lg
px-4
py-2
text-xs
font-semibold

${
  period === "Yearly"
    ? "bg-emerald-600 text-white"
    : "bg-slate-100 text-slate-700"
}

`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div
            className="
flex
items-center
gap-2
"
          >
            <button
              type="button"
              onClick={loadPredictions}
              disabled={loading}
              className="
flex
h-9
w-9
items-center
justify-center
rounded-lg
bg-slate-100
transition
hover:bg-slate-200
disabled:cursor-not-allowed
disabled:opacity-50
"
            >
              <RefreshCw
                className={`

h-4
w-4

${loading ? "animate-spin" : ""}

`}
              />
            </button>

            <div
              className="
flex
h-11
w-11
items-center
justify-center
rounded-xl
bg-emerald-100
"
            >
              <MapPinned
                className="
h-6
w-6
text-emerald-600
"
              />
            </div>
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div
            className="
mt-5
grid
grid-cols-3
gap-3
"
          >
            {defaultPuroks.map((purok) => (
              <div
                key={purok}
                className="
h-20
animate-pulse
rounded-xl
bg-slate-200
"
              />
            ))}
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div
            className="
mt-4
flex
items-center
gap-2
text-red-500
"
          >
            <AlertCircle
              className="
h-4
w-4
"
            />

            <span
              className="
text-sm
"
            >
              {error}
            </span>
          </div>
        )}

        {/* PREDICTIONS */}

        {!loading && !error && (
          <div
            className="
mt-4
grid
grid-cols-3
gap-3
"
          >
            {defaultPuroks.map((purokName) => {
              const purok =
                puroks.find(
                  (item) =>
                    item?.name === purokName || item?.purok === purokName,
                ) || {};

              const prediction = Number(
                purok?.value ??
                  purok?.prediction ??
                  purok?.predictedConsumption ??
                  purok?.predicted_consumption ??
                  purok?.forecast ??
                  0,
              );

              return (
                <div
                  key={purokName}
                  className="
rounded-xl
border
border-slate-200
bg-slate-50
px-3
py-3
transition
hover:border-emerald-200
hover:bg-emerald-50
"
                >
                  <p
                    className="
text-xs
font-semibold
uppercase
tracking-wide
text-slate-500
"
                  >
                    {purokName}
                  </p>

                  <div
                    className="
mt-2
flex
items-end
gap-1
"
                  >
                    <span
                      className="
text-xl
font-extrabold
text-slate-900
"
                    >
                      {prediction.toLocaleString("en-PH")}
                    </span>

                    <span
                      className="
mb-0.5
text-xs
text-slate-400
"
                    >
                      m³
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPerPurokConsumptionCard;
