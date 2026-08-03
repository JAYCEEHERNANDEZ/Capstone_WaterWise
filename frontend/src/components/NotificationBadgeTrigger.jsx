import { FiBell } from "react-icons/fi";

export default function NotificationBadgeTrigger({ buttonRef, isOpen = false, unreadCount = 0, onToggleHub }) {
  return (
    <button
      aria-controls="consumer-notification-popup"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-label="Open system notifications"
      className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-water-700 shadow-sm transition-colors hover:border-water-200 hover:bg-water-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 focus-visible:ring-offset-2"
      data-testid="notification-trigger"
      onClick={onToggleHub}
      ref={buttonRef}
      type="button"
    >
      <FiBell aria-hidden="true" className="h-5 w-5" data-testid="alert-icon" />

      {unreadCount > 0 ? (
        <span
          className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold leading-none text-white"
          data-testid="unread-badge"
        >
          {unreadCount}
        </span>
      ) : null}
    </button>
  );
}
