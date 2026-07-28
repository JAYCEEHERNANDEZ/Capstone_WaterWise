import EventForm from "./EventForm";
import EventRecordsTable from "./EventRecordsTable";
import AnnouncementForm from "./AnnouncementForm";
import AnnouncementPage from "./AnnouncementPage";

export default function EventAnnouncementManagement() {
  return (
    <div className="space-y-8 p-6 bg-gray-100 min-h-screen">
      <EventForm />

      <EventRecordsTable />

      <AnnouncementForm />

      <AnnouncementPage />
    </div>
  );
}