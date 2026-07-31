import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Megaphone,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import AnnouncementForm from "../components/AnnouncementForm";
import AnnouncementPage from "../components/AnnouncementPage";
import LoadingSkeleton from "../components/LoadingSkeleton";
import {
  createAnnouncement,
  fetchAnnouncements,
} from "../services/announcementAPI";

export default function AnnouncementManagementPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setAnnouncements(await fetchAnnouncements());
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ??
          requestError.message ??
          "Unable to load announcements.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = () =>
      fetchAnnouncements()
        .then((records) => {
          if (active) {
            setAnnouncements(records);
            setError("");
          }
        })
        .catch((requestError) => {
          if (active) {
            setError(
              requestError?.response?.data?.message ??
                requestError.message ??
                "Unable to load announcements.",
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });

    refresh();
    const intervalId = window.setInterval(refresh, 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const saveAnnouncement = async (announcement) => {
    try {
      setError("");
      setSuccess("");
      const saved = await createAnnouncement(announcement);
      setSuccess("Announcement published to every consumer portal.");
      await loadAnnouncements();
      return saved;
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.errors;
      setError(
        validationErrors
          ? Object.values(validationErrors).join(" ")
          : requestError?.response?.data?.message ??
              requestError.message ??
              "Unable to save announcement.",
      );
      return false;
    }
  };

  const categories = useMemo(
    () => [...new Set(announcements.map((item) => item.relatedEvent).filter(Boolean))],
    [announcements],
  );

  const filteredAnnouncements = useMemo(() => {
    const term = query.trim().toLowerCase();
    return announcements.filter((announcement) => {
      const matchesCategory =
        category === "all" || announcement.relatedEvent === category;
      const matchesQuery =
        !term ||
        [announcement.title, announcement.content, announcement.relatedEvent]
          .some((value) => String(value ?? "").toLowerCase().includes(term));
      return matchesCategory && matchesQuery;
    });
  }, [announcements, category, query]);

  const datedToday = announcements.filter(
    (announcement) =>
      announcement.publicationDate === new Date().toISOString().slice(0, 10),
  ).length;

  return (
    <main className="space-y-6">
      <header className="ww-page-header relative p-5 text-white sm:p-6">
        <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700 bg-emerald-950 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
              <Megaphone className="h-3.5 w-3.5" />
              Community communication
            </span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Announcement Management
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Publish clear community updates and review every system-wide message delivered to consumers.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-2xl border border-slate-700 bg-navy-900 p-4">
              <Send className="h-5 w-5 text-emerald-300" />
              <p className="mt-3 text-2xl font-extrabold">{announcements.length}</p>
              <p className="text-xs text-slate-300">Published</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-navy-900 p-4">
              <CalendarClock className="h-5 w-5 text-water-300" />
              <p className="mt-3 text-2xl font-extrabold">{datedToday}</p>
              <p className="text-xs text-slate-300">Dated today</p>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700" role="status">
          {success}
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.5fr)]">
        <div className="xl:sticky xl:top-6">
          <AnnouncementForm onSubmit={saveAnnouncement} />
        </div>

        <div className="min-w-0 space-y-4">
          <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search announcements</span>
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title, message, or category"
                type="search"
                value={query}
              />
            </label>
            <select
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <button
              aria-label="Refresh announcements"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              disabled={loading}
              onClick={loadAnnouncements}
              type="button"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </section>

          {loading ? (
            <LoadingSkeleton label="Loading announcements" variant="list" />
          ) : (
            <AnnouncementPage announcements={filteredAnnouncements} />
          )}
        </div>
      </div>
    </main>
  );
}
