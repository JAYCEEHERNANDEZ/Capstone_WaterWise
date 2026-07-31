import { FiBell } from "react-icons/fi";

export default function NotificationBadgeTrigger({ unreadCount = 0, onToggleHub }) {
  return (
    <button
      aria-label="Open system notifications"
      className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/80 bg-white/75 text-sky-700 shadow-sm transition hover:border-sky-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
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
