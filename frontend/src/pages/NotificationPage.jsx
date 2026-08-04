import LoadingSkeleton from "../components/LoadingSkeleton";
import NotificationCard from "../components/NotificationCard";

export default function NotificationPage({
  isLoading = false,
  notifications = [],
  onDelete,
  onMarkAsRead,
  onNotificationClick,
}) {
  const unifiedNotifications = [...notifications].sort((left, right) => {
    const dateComparison = String(right.date ?? "").localeCompare(String(left.date ?? ""));
    return dateComparison || Number(right.id) - Number(left.id);
  });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-2" data-testid="notification-hub-page">
      {isLoading ? (
        <LoadingSkeleton className="p-2" count={4} label="Loading notifications" variant="notifications" />
      ) : unifiedNotifications.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
          <p className="font-bold text-navy-900">You’re all caught up</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">New billing updates and community announcements will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-1">
          {unifiedNotifications.map((notification) => (
            <NotificationCard
              item={notification}
              key={notification.id}
              onDelete={onDelete}
              onMarkAsRead={onMarkAsRead}
              onNotificationClick={onNotificationClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
