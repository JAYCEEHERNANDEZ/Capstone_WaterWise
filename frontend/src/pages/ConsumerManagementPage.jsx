import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiPlus, FiUsers } from "react-icons/fi";
import ConsumerForm from "../components/ConsumerForm";
import ConsumerListTable from "../components/ConsumerListTable";
import Filter from "../components/Filter";
import KPI from "../components/KPI";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import Search from "../components/Search";
import { useToast } from "../components/Toast";
import { createConsumer, fetchConsumerDirectory, updateConsumer } from "../services/consumerDirectoryAPI";

function toManagementConsumer(consumer) {
  return {
    id: consumer.id,
    accountName: consumer.username ?? consumer.consumerNo ?? "",
    fullName: consumer.full_name ?? consumer.consumerName ?? consumer.name ?? "",
    purok: consumer.purok ?? (consumer.purok_no == null ? "Unassigned" : `Purok ${consumer.purok_no}`),
    email: consumer.email ?? "Not available",
    contactNumber: consumer.contactNumber ?? consumer.contact_number ?? "",
    status: consumer.status ?? "inactive",
  };
}

function getConsumerRequestError(requestError, fallback) {
  const fieldErrors = Object.values(requestError.response?.data?.errors ?? {}).filter(Boolean);
  return fieldErrors.length ? fieldErrors.join(" ") : requestError.response?.data?.message ?? fallback;
}

function ConsumerManagementPage() {
  const toast = useToast();
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
      const savedConsumer = toManagementConsumer(created);
      setConsumers((current) => [savedConsumer, ...current]);
      setSelectedConsumer(null);
      setFormMode("");
      toast.success("Resident added", `${savedConsumer.fullName}'s account is ready to use.`);
      return true;
    } catch (requestError) {
      const message = getConsumerRequestError(requestError, "Unable to create resident.");
      setError(message);
      toast.error("Resident not added", message);
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
      toast.success("Resident updated", `${savedConsumer.fullName}'s profile changes were saved.`);
      return true;
    } catch (requestError) {
      const message = getConsumerRequestError(requestError, "Unable to update resident.");
      setError(message);
      toast.error("Resident not updated", message);
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

  return (
    <main className="space-y-6">
      <PageHeader description="Register community accounts, review service locations, and monitor billing readiness from one workspace." eyebrow="Resident accounts" title="Resident management" />

      <div className="hidden justify-end lg:flex">
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-water-600 px-5 font-bold text-white shadow-card transition-colors hover:bg-water-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 focus-visible:ring-offset-2"
          onClick={() => {
            setSelectedConsumer(null);
            setFormMode("add");
          }}
          type="button"
        >
          <FiPlus aria-hidden="true" className="h-5 w-5" />
          Add Resident
        </button>
      </div>

      <section aria-label="Resident summary" className="grid grid-cols-2 gap-2 sm:gap-3">
        <KPI description="Registered community accounts" icon={FiUsers} title="Total residents" value={consumers.length} />
        <KPI description="Accounts ready for service" icon={FiCheckCircle} title="Active accounts" value={consumers.filter((item) => item.status?.toLowerCase() === "active").length} />
      </section>

      <Modal
        closeLabel="Close resident form"
        description={formMode === "edit" ? "Update the resident's service information." : "Enter the resident's details and create secure sign-in credentials."}
        eyebrow="Resident account"
        isOpen={Boolean(formMode)}
        onClose={closeForm}
        showCloseButton={false}
        size="md"
        title={formMode === "edit" ? "Edit resident" : "Add resident"}
      >
            {error && (
              <p
                className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 sm:mx-6"
                role="alert"
              >
                {error}
              </p>
            )}
            <ConsumerForm
              embedded
              initialData={formMode === "edit" ? selectedConsumer : null}
              key={`${formMode}-${selectedConsumer?.id ?? "new"}`}
              onCancel={closeForm}
              onSubmit={formMode === "edit" ? editConsumer : addConsumer}
              requirePassword={formMode === "add"}
            />
      </Modal>

      {error && !formMode && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">{error}</p>}

      <div
        aria-label="Resident table controls"
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
        role="search"
      >
        <Search ariaLabel="Search residents by username or name" className="flex-1" onValueChange={setQuery} placeholder="Search username or name" value={query} />
        <Filter ariaLabel="Filter residents by purok" className="w-full sm:w-48" onValueChange={setPurok} options={purokOptions} value={purok} />
      </div>

      <ConsumerListTable
        consumers={visibleConsumers}
        isLoading={isLoading}
        onEdit={selectConsumer}
      />

      <button
        aria-label="Add resident"
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-30 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-water-600 px-5 font-bold text-white shadow-modal transition-colors hover:bg-water-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 focus-visible:ring-offset-2 lg:hidden"
        onClick={() => {
          setSelectedConsumer(null);
          setFormMode("add");
        }}
        type="button"
      >
        <FiPlus aria-hidden="true" className="h-5 w-5" />
        Add Resident
      </button>
    </main>
  );
}

export default ConsumerManagementPage;
