import EventForm from "./EventForm";
import EventRecordsTable from "./EventRecordsTable";
import AnnouncementForm from "./AnnouncementForm";
import AnnouncementPage from "./AnnouncementPage";

export default function EventAnnouncementManagement() {
  return (
    <div className="space-y-6">
      <EventForm />

      <EventRecordsTable />

      <AnnouncementForm />

      <AnnouncementPage />
    </div>
  );
}
