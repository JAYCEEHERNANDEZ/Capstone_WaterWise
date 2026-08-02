import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiPlus, FiUsers, FiX } from "react-icons/fi";
import ConsumerForm from "../components/ConsumerForm";
import ConsumerListTable from "../components/ConsumerListTable";
import Filter from "../components/Filter";
import Search from "../components/Search";
import { createConsumer, fetchConsumerDirectory, updateConsumer } from "../services/consumerDirectoryAPI";

function toManagementConsumer(consumer) {
  return {
    id: consumer.id,
    accountName: consumer.username ?? consumer.consumerNo ?? "",
    fullName: consumer.full_name ?? consumer.consumerName ?? consumer.name ?? "",
    purok: consumer.purok ?? (consumer.purok_no == null ? "Unassigned" : `Purok ${consumer.purok_no}`),
    email: consumer.email ?? "Not available",
    status: consumer.status ?? "inactive",
  };
}

function getConsumerRequestError(requestError, fallback) {
  const fieldErrors = Object.values(requestError.response?.data?.errors ?? {}).filter(Boolean);
  return fieldErrors.length ? fieldErrors.join(" ") : requestError.response?.data?.message ?? fallback;
}

function ConsumerManagementPage() {
  const [consumers, setConsumers] = useState([]);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [formMode, setFormMode] = useState("");
  const [query, setQuery] = useState("");
  const [purok, setPurok] = useState("all");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    fetchConsumerDirectory({ signal: controller.signal })
      .then((records) => {
        if (isActive) {
          setConsumers(records.map(toManagementConsumer));
        }
      })
      .catch((requestError) => {
        if (isActive && requestError.code !== "ERR_CANCELED") {
          setError(requestError.response?.data?.message ?? "Unable to load consumers.");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    const intervalId = window.setInterval(() => {
      fetchConsumerDirectory()
        .then((records) => {
          if (isActive) {
            setConsumers(records.map(toManagementConsumer));
          }
        })
        .catch(() => {});
    }, 15000);

    return () => {
      isActive = false;
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  const addConsumer = async (consumer) => {
    try {
      setError("");
      const created = await createConsumer(consumer);
      const savedConsumer = {
        id: created.id,
        accountName: created.username,
        fullName: created.full_name ?? created.name,
        purok: created.purok,
        email: created.email,
        status: created.status ?? "active",
      };
      setConsumers((current) => [savedConsumer, ...current]);
      setSelectedConsumer(null);
      setFormMode("");
      return true;
    } catch (requestError) {
      setError(getConsumerRequestError(requestError, "Unable to create consumer."));
      return false;
    }
  };

  const editConsumer = async (consumer) => {
    try {
      setError("");
      const updated = await updateConsumer(selectedConsumer.id, consumer);
      const savedConsumer = toManagementConsumer(updated);
      setConsumers((current) => current.map((item) => item.id === savedConsumer.id ? savedConsumer : item));
      setSelectedConsumer(null);
      setFormMode("");
      return true;
    } catch (requestError) {
      setError(getConsumerRequestError(requestError, "Unable to update consumer."));
      return false;
    }
  };

  const visibleConsumers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return consumers.filter((consumer) =>
      (!term || [consumer.accountName, consumer.fullName]
        .some((value) => String(value).toLowerCase().includes(term))) &&
      (purok === "all" || consumer.purok === purok),
    );
  }, [consumers, purok, query]);

  const purokOptions = useMemo(() => {
    const values = [...new Set(consumers.map((consumer) => consumer.purok).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second, undefined, { numeric: true }));
    return [
      { label: "All puroks", value: "all" },
      ...values.map((value) => ({ label: value, value })),
    ];
  }, [consumers]);

  const selectConsumer = (consumer) => {
    setSelectedConsumer(consumer);
    setFormMode("edit");
  };

  const closeForm = () => {
    setFormMode("");
    setSelectedConsumer(null);
    setError("");
  };

  useEffect(() => {
    if (!formMode) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeForm();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [formMode]);

  return (
    <main className="space-y-6">
      <header className="ww-page-header p-5 text-white sm:p-6">
        <p className="ww-eyebrow">Resident accounts</p>
        <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Resident management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Register community accounts, review service locations, and monitor billing readiness from one workspace.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <div className="rounded-2xl border border-slate-700 bg-navy-900 p-4"><FiUsers className="text-water-300" /><p className="mt-3 font-mono text-2xl font-bold tabular-nums">{consumers.length}</p><p className="text-xs text-slate-300">Total residents</p></div>
            <div className="rounded-2xl border border-slate-700 bg-navy-900 p-4"><FiCheckCircle className="text-emerald-300" /><p className="mt-3 font-mono text-2xl font-bold tabular-nums">{consumers.filter((item) => item.status?.toLowerCase() === "active").length}</p><p className="text-xs text-slate-300">Active accounts</p></div>
          </div>
        </div>
      </header>

      {formMode && (
        <div
          aria-labelledby="consumer-form-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
          role="dialog"
        >
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl shadow-2xl">
            <button
              aria-label="Close consumer form"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-navy-900"
              onClick={closeForm}
              type="button"
            >
              <FiX className="h-5 w-5" />
            </button>
            {error && (
              <p
                className="rounded-t-3xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}
            <ConsumerForm
              initialData={formMode === "edit" ? selectedConsumer : null}
              key={`${formMode}-${selectedConsumer?.id ?? "new"}`}
              onCancel={closeForm}
              onSubmit={formMode === "edit" ? editConsumer : addConsumer}
              requirePassword={formMode === "add"}
            />
          </div>
        </div>
      )}

      {error && !formMode && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">{error}</p>}

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <Search ariaLabel="Search residents by username or name" className="flex-1" onValueChange={setQuery} placeholder="Search username or name" value={query} />
        <Filter ariaLabel="Filter residents by purok" className="sm:w-44" onValueChange={setPurok} options={purokOptions} value={purok} />
      </section>

      <ConsumerListTable
        consumers={visibleConsumers}
        isLoading={isLoading}
        onEdit={selectConsumer}
      />

      <button
        aria-label="Add resident"
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-water-600 text-white shadow-raised transition-colors hover:bg-water-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 focus-visible:ring-offset-2 lg:bottom-6 lg:right-6"
        onClick={() => {
          setSelectedConsumer(null);
          setFormMode("add");
        }}
        title="Add resident"
        type="button"
      >
        <FiPlus aria-hidden="true" className="h-6 w-6" />
      </button>
    </main>
  );
}

export default ConsumerManagementPage;
