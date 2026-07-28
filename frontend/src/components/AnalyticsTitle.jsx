const AnalyticsTitle = () => {
  return (
    <section className="mb-5">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
            WaterWise Analytics
          </span>

          <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500 sm:text-base">
            WaterWise Intelligent Decision Support Services
          </p>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsTitle;