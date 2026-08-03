import { useEffect, useRef, useState } from "react";
import {
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiCreditCard,
  FiDroplet,
  FiFileText,
  FiGrid,
  FiMessageSquare,
  FiUsers,
  FiWifiOff,
  FiX,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router";
import { getCurrentAccount, logout } from "../services/auth.service";
import { getStoredAccount } from "../services/authToken";
import { isCanceledRequest } from "../services/apiClient";
import {
  fetchNotifications,
  markNotificationRead,
} from "../services/consumerPortal.service";
import NotificationPage from "../pages/NotificationPage";
import Header from "./Header";
import NotificationBadgeTrigger from "./NotificationBadgeTrigger";
import Sidebar from "./Sidebar";
import { useToast } from "./Toast";

const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    profile: "Barangay official",
    userName: "Barangay Admin",
    basePath: "/admin",
    homePath: "/admin/dashboard",
    links: [
      { label: "Dashboard", path: "/admin/dashboard", Icon: FiGrid },
      { label: "Residents", path: "/admin/consumers", Icon: FiUsers },
      { label: "Readings", path: "/admin/readings", Icon: FiBookOpen },
      { label: "Billing", path: "/admin/billings", Icon: FiFileText },
      { label: "Payments", path: "/admin/payments", Icon: FiCreditCard },
      { label: "Events", path: "/admin/events", Icon: FiCalendar },
      {
        label: "Announcements",
        path: "/admin/announcements",
        Icon: FiMessageSquare,
      },
      { label: "Analytics", path: "/admin/analytics", Icon: FiBarChart2 },
      { label: "Reports", path: "/admin/reports", Icon: FiFileText },
    ],
  },
  "meter-reader": {
    label: "Meter Reader",
    profile: "Field personnel",
    userName: "Meter Reader",
    basePath: "/meter-reader",
    homePath: "/meter-reader/readings-entry",
    links: [
      {
        label: "Readings Entry",
        path: "/meter-reader/readings-entry",
        Icon: FiBookOpen,
      },
    ],
  },
  consumer: {
    label: "Resident",
    profile: "Community resident",
    userName: "Iverene Grace M. Causapin",
    basePath: "/consumer",
    homePath: "/consumer/usage-metrics",
    links: [
      { label: "Home", path: "/consumer/usage-metrics", Icon: FiDroplet },
      { label: "Bills", path: "/consumer/billing-ledger", Icon: FiFileText },
    ],
  },
};

function getRoleFromPath(pathname) {
  return Object.entries(ROLE_CONFIG).find(([, config]) =>
    pathname.startsWith(config.basePath),
  )?.[0];
}

export default function AppLayout({ children }) {
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const notificationCloseRef = useRef(null);
  const pathRole = getRoleFromPath(location.pathname);
  const [account, setAccount] = useState(getStoredAccount);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [accountName, setAccountName] = useState("");
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const activeRole = account?.role ?? pathRole ?? "consumer";
  const activeRoleConfig = ROLE_CONFIG[activeRole] ?? ROLE_CONFIG.consumer;

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let notificationIntervalId;

    getCurrentAccount({ signal: controller.signal })
      .then(({ user }) => {
        setAccount(user);
        setAccountName(user?.name ?? user?.email ?? "");
      })
      .catch((error) => {
        setAccountName("");
        if (error.status === 401) navigate("/login");
      });

    if (activeRole === "consumer") {
      queueMicrotask(() => setIsNotificationLoading(true));

      const refreshNotifications = (isInitialLoad = false) =>
        fetchNotifications({ signal: controller.signal })
          .then((incomingNotifications) =>
            setNotifications((currentNotifications) =>
              incomingNotifications.map((incoming) => ({
                ...incoming,
                isRead:
                  incoming.isRead ||
                  currentNotifications.some(
                    (current) => current.id === incoming.id && current.isRead,
                  ),
              })),
            ),
          )
          .catch((error) => {
            if (!isCanceledRequest(error)) setNotifications([]);
          })
          .finally(() => {
            if (isInitialLoad && !controller.signal.aborted) {
              setIsNotificationLoading(false);
            }
          });

      refreshNotifications(true);
      notificationIntervalId = window.setInterval(refreshNotifications, 15000);
    } else {
      queueMicrotask(() => {
        setNotifications([]);
        setIsNotificationLoading(false);
      });
    }

    return () => {
      controller.abort();
      if (notificationIntervalId) {
        window.clearInterval(notificationIntervalId);
      }
    };
  }, [activeRole, navigate]);

  // The drawer behaves as a focused modal on smaller screens and restores focus
  // to the originating control when it closes.
  useEffect(() => {
    if (!isNotificationOpen) return undefined;

    const previouslyFocusedElement = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsNotificationOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    notificationCloseRef.current?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus?.();
    };
  }, [isNotificationOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out", "You have securely signed out of WaterWise.");
    } catch {
      toast.warning("Signed out locally", "The server could not confirm sign-out, but this device session was cleared.");
    } finally {
      setAccount(null);
      setIsNotificationOpen(false);
      navigate("/login");
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((currentNotifications) =>
        currentNotifications.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item,
        ),
      );
    } catch {
      // Keep the unread state when the backend update fails.
      toast.error("Notification not updated", "WaterWise could not mark this notification as read.");
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.category === "bill" && notification.actionPath) {
      setIsNotificationOpen(false);
      navigate(notification.actionPath);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header
        accountName={accountName || activeRoleConfig.userName}
        activeRole={activeRole}
        activeRoleLabel={activeRoleConfig.label}
        notificationSlot={
          activeRole === "consumer" ? (
            <NotificationBadgeTrigger
              onToggleHub={() => setIsNotificationOpen((isOpen) => !isOpen)}
              unreadCount={unreadCount}
            />
          ) : null
        }
        onLogout={handleLogout}
        onProfile={activeRole === "consumer" ? () => navigate("/consumer/profile-details") : undefined}
        title="WaterWise"
      />

      {!isOnline && (
        <div
          className="sticky top-16 z-30 flex min-h-11 items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-semibold text-amber-800"
          role="status"
        >
          <FiWifiOff aria-hidden="true" className="h-4 w-4 shrink-0" />
          You are offline. New changes will be submitted after you reconnect.
        </div>
      )}

      {/* Desktop content is anchored beside the fixed-width sidebar; mobile
          content reserves space for the persistent bottom navigation. */}
      <div className="w-full lg:flex">
        <Sidebar
          activeRoleLabel={activeRoleConfig.label}
          items={activeRoleConfig.links}
        />

        <main
          className="ww-workspace min-w-0 flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0"
          id="main-content"
        >
          <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            {children}
          </div>
        </main>
      </div>

      <button
        aria-label="Close notification center"
        className={[
          "fixed inset-0 z-40 bg-slate-950/45 transition-opacity duration-200",
          isNotificationOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setIsNotificationOpen(false)}
        tabIndex={isNotificationOpen ? 0 : -1}
        type="button"
      />

      <aside
        aria-hidden={!isNotificationOpen}
        aria-label="Notification center"
        aria-modal={isNotificationOpen ? "true" : undefined}
        className={[
          "fixed inset-y-0 right-0 z-50 h-full w-[min(94vw,27rem)] border-l border-slate-200 bg-white shadow-2xl transition-transform duration-200 ease-out",
          isNotificationOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        inert={!isNotificationOpen}
        role="dialog"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Notification center
            </h2>
            <p className="text-xs font-medium text-slate-500">
              {unreadCount} unread alert{unreadCount === 1 ? "" : "s"}
            </p>
          </div>
          <button
            ref={notificationCloseRef}
            aria-label="Close notification center"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-water-200 hover:bg-water-50 hover:text-water-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 focus-visible:ring-offset-2"
            onClick={() => setIsNotificationOpen(false)}
            type="button"
          >
            <FiX aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="h-[calc(100%-4rem)] overflow-y-auto">
          <NotificationPage
            isLoading={isNotificationLoading}
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAsRead={handleMarkNotificationAsRead}
          />
        </div>
      </aside>
    </div>
  );
}
