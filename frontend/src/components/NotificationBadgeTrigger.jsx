import { FiBell } from "react-icons/fi";

export default function NotificationBadgeTrigger({ unreadCount = 0, onToggleHub }) {
  return (
    <button
      aria-label="Open system notifications"
      className="relative flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-[#0284C7] transition hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:ring-offset-2"
      data-testid="notification-trigger"
      onClick={onToggleHub}
      type="button"
    >
      <FiBell aria-hidden="true" className="h-5 w-5" data-testid="alert-icon" />

      {unreadCount > 0 ? (
        <span
          className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#DC2626] px-1.5 text-xs font-bold leading-none text-white"
          data-testid="unread-badge"
        >
          {unreadCount}
        </span>
      ) : null}
    </button>
  );
}
