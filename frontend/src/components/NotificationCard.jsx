import { FiBell, FiFileText, FiTrash2 } from "react-icons/fi";

export default function NotificationCard({ item, onDelete, onMarkAsRead, onNotificationClick }) {
  if (!item) return null;

  const handleClick = () => {
    if (!item.isRead && onMarkAsRead) {
      onMarkAsRead(item.id);
    }

    onNotificationClick?.(item);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete?.(item.id);
  };

  const Icon = item.category === "bill" ? FiFileText : FiBell;

  return (
    <div
      data-testid={`notification-card-${item.id}`}
      data-id={item.id}
      data-is-read={item.isRead}
      
      className={`mb-3 cursor-pointer rounded-2xl border bg-white p-4 transition-colors hover:border-water-300 ${
        item.isRead
          ? "border-slate-200 text-slate-500"
          : "border-water-200 text-slate-900 font-semibold shadow-sm"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.isRead ? "bg-slate-100 text-slate-500" : "bg-water-50 text-water-700"}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {!item.isRead && <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-water-600" />}
            <h5 className="text-sm font-bold leading-5">{item.title}</h5>
            {!item.isRead && <span className="sr-only">Unread</span>}
          </div>
          <p className="mt-1 text-sm font-normal leading-5">{item.message}</p>
        </div>
        {onDelete && (
          <button
            aria-label={`Delete ${item.title}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            onClick={handleDelete}
            title="Delete notification"
            type="button"
          >
            <FiTrash2 aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
