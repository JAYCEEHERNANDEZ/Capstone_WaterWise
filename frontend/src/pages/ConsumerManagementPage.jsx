import { useEffect, useMemo, useState } from "react";
import { FiCreditCard, FiPlus, FiSearch, FiUsers, FiX } from "react-icons/fi";
import ConsumerForm from "../components/ConsumerForm";
import ConsumerListTable from "../components/ConsumerListTable";
import { createConsumer, fetchConsumerDirectory, updateConsumer } from "../services/consumerDirectoryAPI";

function toManagementConsumer(consumer) {
  return {
    id: consumer.id,
    accountName: consumer.username ?? consumer.consumerNo ?? "",
    fullName: consumer.full_name ?? consumer.consumerName ?? consumer.name ?? "",
    purok: consumer.purok ?? (consumer.purok_no == null ? "Unassigned" : `Purok ${consumer.purok_no}`),
    email: consumer.email ?? "Not available",
    paymentStatus: consumer.paymentStatus ?? "No billing record",
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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetchConsumerDirectory({ signal: controller.signal })
      .then((records) => setConsumers(records.map(toManagementConsumer)))
      .catch((requestError) => {
        if (requestError.code !== "ERR_CANCELED") {
          setError(requestError.response?.data?.message ?? "Unable to load consumers.");
        }
      })
      .finally(() => setIsLoading(false));

    const intervalId = window.setInterval(() => {
      fetchConsumerDirectory()
        .then((records) => setConsumers(records.map(toManagementConsumer)))
        .catch(() => {});
    }, 15000);

    return () => {
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
        paymentStatus: "No billing record",
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
    if (!term) return consumers;
    return consumers.filter((consumer) =>
      [consumer.accountName, consumer.fullName, consumer.email, consumer.purok]
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [consumers, query]);

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
      <header className="ww-page-header p-6 text-white sm:p-8">
        <p className="ww-eyebrow">Resident accounts</p>
        <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Resident management</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Register community accounts, review service locations, and monitor billing readiness from one workspace.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><FiUsers className="text-sky-300" /><p className="mt-3 text-2xl font-bold">{consumers.length}</p><p className="text-xs text-slate-300">Total consumers</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><FiCreditCard className="text-emerald-300" /><p className="mt-3 text-2xl font-bold">{consumers.filter((item) => item.paymentStatus === "Paid").length}</p><p className="text-xs text-slate-300">Paid accounts</p></div>
          </div>
        </div>
      </header>

      {formMode && (
        <div
          aria-labelledby="consumer-form-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
          role="dialog"
        >
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl shadow-2xl">
            <button
              aria-label="Close consumer form"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block max-w-xl flex-1">
        <span className="sr-only">Search consumers</span>
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" onChange={(event) => setQuery(event.target.value)} placeholder="Search account, name, email, or purok" type="search" value={query} />
      </label>
      <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 font-bold text-white hover:bg-sky-700" onClick={() => { setSelectedConsumer(null); setFormMode("add"); }} type="button"><FiPlus />Add Consumer</button>
      </div>

      {isLoading ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">Loading consumers...</p>
      ) : (
        <ConsumerListTable consumers={visibleConsumers} onEdit={selectConsumer} />
      )}
    </main>
  );
}

export default ConsumerManagementPage;
