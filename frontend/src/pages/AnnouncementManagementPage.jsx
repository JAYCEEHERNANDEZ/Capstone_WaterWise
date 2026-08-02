import { useCallback, useEffect, useMemo, useState } from "react";
import AnnouncementForm from "../components/AnnouncementForm";
import AnnouncementPage from "../components/AnnouncementPage";
import Filter from "../components/Filter";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Search from "../components/Search";
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

  return (
    <main className="space-y-6">

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
          <div
            aria-label="Announcement list controls"
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
            role="search"
          >
            <Search
              ariaLabel="Search announcements"
              className="flex-1"
              onValueChange={setQuery}
              placeholder="Search title, message, or category"
              tone="emerald"
              value={query}
            />
            <Filter
              ariaLabel="Filter announcements by category"
              className="w-full sm:w-52"
              onValueChange={setCategory}
              options={[
                { label: "All categories", value: "all" },
                ...categories.map((item) => ({ label: item, value: item })),
              ]}
              tone="emerald"
              value={category}
            />

          </div>

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
