import { useEffect, useState } from "react";
import {
  FiDroplet,
  FiFileText,
  FiHome,
  FiMail,
  FiPhone,
  FiShield,
} from "react-icons/fi";
import ConsumerInfoGrid from "../components/ConsumerInfoGrid";
import CurrentBalanceCard from "../components/CurrentBalanceCard";
import MonthlyConsumptionWidget from "../components/MonthlyConsumptionWidget";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { fetchConsumerProfile } from "../services/consumerPortal.service";
import { isCanceledRequest } from "../services/apiClient";

function DetailItem({ Icon, label, value }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-water-50">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-water-600 shadow-sm">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-slate-500">
          {label}
        </dt>
        <dd className="mt-1 break-words text-sm font-bold text-navy-900 sm:text-base">
          {value}
        </dd>
      </div>
    </div>
  );
}

export default function ConsumerProfile({ consumer: consumerProp }) {
  const usesApi = consumerProp === undefined;
  const [loadedConsumer, setLoadedConsumer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!usesApi) return undefined;

    const controller = new AbortController();
    fetchConsumerProfile({ signal: controller.signal })
      .then(setLoadedConsumer)
      .catch((requestError) => {
        if (!isCanceledRequest(requestError)) setError(requestError.message);
      });

    return () => controller.abort();
  }, [usesApi]);

  const consumer = usesApi ? loadedConsumer : consumerProp;
  const pageHeader = (
    <header className="ww-page-header text-white">
      <p className="ww-eyebrow">Resident portal</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Household profile</h1>
      <p className="mt-1.5 max-w-3xl text-sm leading-6 text-water-100">
        Review your account holder, service address, meter information, and latest reading.
      </p>
    </header>
  );

  if (error) {
    return (
      <div className="space-y-5">
        {pageHeader}
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">{error}</div>
      </div>
    );
  }

  if (!consumer) {
    return (
      <div className="space-y-5">
        {pageHeader}
        <LoadingSkeleton label="Loading consumer profile" variant="profile" />
      </div>
    );
  }

  const consumptionDifference = Number(
    (consumer.currentReading - consumer.previousReading).toFixed(1),
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {pageHeader}
      
      <section className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        <ConsumerInfoGrid
          houseNumber={consumer.houseNumber}
          name={consumer.name}
          purok={consumer.purok}
        />
        <CurrentBalanceCard amountDue={consumer.activeAmountDue} />
        <MonthlyConsumptionWidget
          month={consumer.latestMonth}
          usage={consumer.volumetricUsage}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="ww-glass-strong rounded-2xl p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-water-600">
            Household account
          </p>
          <h3 className="mt-1.5 text-xl font-extrabold tracking-[-0.03em] text-navy-900">
            Contact and location
          </h3>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <DetailItem Icon={FiMail} label="Email address" value={consumer.email} />
            <DetailItem Icon={FiPhone} label="Contact number" value={consumer.contactNumber} />
            <DetailItem Icon={FiHome} label="House number" value={consumer.houseNumber} />
            <DetailItem Icon={FiDroplet} label="Meter number" value={consumer.meterNumber} />
          </dl>
        </div>

        <div className="ww-glass-strong rounded-2xl p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-water-600">
            Latest reading
          </p>
          <h3 className="mt-1.5 text-xl font-extrabold tracking-[-0.03em] text-navy-900">
            Meter snapshot
          </h3>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Previous
              </p>
              <p className="mt-2 font-mono text-xl font-bold text-navy-900">
                {consumer.previousReading.toFixed(1)} m³
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Current
              </p>
              <p className="mt-2 font-mono text-xl font-bold text-navy-900">
                {consumer.currentReading.toFixed(1)} m³
              </p>
            </div>
            <div className="col-span-2 rounded-2xl bg-water-50 p-4 sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-water-600">
                Consumed
              </p>
              <p className="mt-2 font-mono text-xl font-bold text-water-600">
                {consumptionDifference.toFixed(1)} m³
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex gap-3">
              <FiFileText aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-water-600" />
              <div>
                <p className="text-sm font-bold text-navy-900">
                  Last reading date
                </p>
                <p className="mt-1 font-mono text-sm text-slate-600">
                  {consumer.lastReadingDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex gap-3">
          <FiShield aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div>
            <p className="text-sm font-bold text-navy-900">
              Need to correct your details?
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Your account details are read-only for your protection. Contact
              the barangay office if your name, contact information, service
              address, or meter details need to be corrected.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
