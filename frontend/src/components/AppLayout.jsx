import { useEffect, useState } from "react";
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
import Header from "./Header";
import NotificationBadgeTrigger from "./NotificationBadgeTrigger";
import NotificationPage from "../pages/NotificationPage";
import Sidebar from "./Sidebar";

const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    profile: "Barangay Official",
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
      { label: "Announcements", path: "/admin/announcements", Icon: FiMessageSquare },
      { label: "Analytics", path: "/admin/analytics", Icon: FiBarChart2 },
      { label: "Reports", path: "/admin/reports", Icon: FiFileText },
    ],
  },
  "meter-reader": {
    label: "Meter Reader",
    profile: "Field Personnel",
    userName: "Meter Reader",
    basePath: "/meter-reader",
    homePath: "/meter-reader/readings-entry",
    links: [
      { label: "Readings Entry", path: "/meter-reader/readings-entry", Icon: FiBookOpen },
    ],
  },
  consumer: {
    label: "Consumer",
    profile: "Community Portal",
    userName: "Iverene Grace M. Causapin",
    basePath: "/consumer",
    homePath: "/consumer/usage-metrics",
    links: [
      { label: "Home", path: "/consumer/usage-metrics", Icon: FiDroplet },
      { label: "Bills", path: "/consumer/billing-ledger", Icon: FiFileText },
      { label: "Profile", path: "/consumer/profile-details", Icon: FiUsers },
    ],
  },
};

function getRoleFromPath(pathname) {
  return Object.entries(ROLE_CONFIG).find(([, config]) =>
    pathname.startsWith(config.basePath),
  )?.[0];
}

export default function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathRole = getRoleFromPath(location.pathname);
  const [account, setAccount] = useState(getStoredAccount);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [accountName, setAccountName] = useState("");
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const activeRole = account?.role ?? pathRole;
  const activeRoleConfig = ROLE_CONFIG[activeRole];

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
      const refreshNotifications = () =>
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
              }))
            )
          )
          .catch((error) => {
            if (!isCanceledRequest(error)) setNotifications([]);
          });

      refreshNotifications();
      notificationIntervalId = window.setInterval(refreshNotifications, 15000);
    } else {
      queueMicrotask(() => setNotifications([]));
    }

    return () => {
      controller.abort();
      if (notificationIntervalId) {
        window.clearInterval(notificationIntervalId);
      }
    };
  }, [activeRole, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
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
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.category === "bill" && notification.actionPath) {
      setIsNotificationOpen(false);
      navigate(notification.actionPath);
    }
  };

  return (
    <div className={`ww-app min-h-screen bg-transparent font-sans text-slate-900 ${activeRole === "admin" ? "admin-workspace" : ""}`}>
      <Header
        accountName={accountName || activeRoleConfig.userName}
        activeRole={activeRole}
        activeRoleLabel={activeRoleConfig.label}
        notificationSlot={activeRole === "consumer" ? (
          <NotificationBadgeTrigger
            onToggleHub={() => setIsNotificationOpen((isOpen) => !isOpen)}
            unreadCount={unreadCount}
          />
        ) : null}
        onLogout={handleLogout}
        title="WaterWise"
        compact
      />

      {!isOnline && (
        <div className="sticky top-16 z-20 flex min-h-11 items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-semibold text-amber-700 sm:top-[72px]" role="status">
          <FiWifiOff aria-hidden="true" className="h-4 w-4 shrink-0" />
          You are offline. New changes are not submitted until you reconnect.
        </div>
      )}

      <div className="w-full lg:flex">
        <Sidebar
          activeRoleLabel={activeRoleConfig.label}
          items={activeRoleConfig.links}
          compact
        />

        <main className="ww-workspace min-w-0 flex-1 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0">
          <div className="h-full px-4 py-4 sm:px-5 lg:px-6">
            <div className="w-full">
              {children}
            </div>
          </div>
        </main>
      </div>

      <div
        aria-hidden={!isNotificationOpen}
        className={[
          "fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] transition-opacity",
          isNotificationOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setIsNotificationOpen(false)}
      />

      <aside
        aria-label="Notification center"
        className={[
          "ww-glass-strong fixed inset-y-0 right-0 z-50 h-full w-[min(94vw,27rem)] border-l border-white/70 shadow-[0_24px_80px_rgba(8,32,50,0.2)] transition-transform duration-300 ease-out",
          isNotificationOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-slate-200/70 bg-white/70 px-5">
          <div>
            <p className="text-sm font-bold text-slate-900">
              Notification Center
            </p>
            <p className="text-xs font-medium text-slate-500">
              {unreadCount} unread alert{unreadCount === 1 ? "" : "s"}
            </p>
          </div>
          <button
            aria-label="Close notification center"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-sky-700 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
            onClick={() => setIsNotificationOpen(false)}
            type="button"
          >
            <FiX aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <NotificationPage
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAsRead={handleMarkNotificationAsRead}
        />
      </aside>
    </div>
  );
}
