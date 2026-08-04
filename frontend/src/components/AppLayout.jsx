import { useEffect, useRef, useState } from "react";
import {
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiCreditCard,
  FiFileText,
  FiGrid,
  FiHome,
  FiMessageSquare,
  FiUsers,
  FiWifiOff,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router";
import { getCurrentAccount, logout } from "../services/auth.service";
import { getStoredAccount } from "../services/authToken";
import { isCanceledRequest } from "../services/apiClient";
import { getNotificationPresentation } from "../utils/notificationPresentation";
import {
  fetchNotifications,
  markNotificationRead,
} from "../services/consumerPortal.service";
import NotificationPage from "../pages/NotificationPage";
import Header from "./Header";
import ChangePasswordModal from "./ChangePasswordModal";
import LogoutConfirmationModal from "./LogoutConfirmationModal";
import NotificationBadgeTrigger from "./NotificationBadgeTrigger";
import Modal from "./Modal";
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
    homePath: "/consumer/home",
    links: [
      { label: "Home", path: "/consumer/home", Icon: FiHome },
      { label: "Bills", path: "/consumer/billing-ledger", Icon: FiFileText },
      { label: "Analytics", path: "/consumer/analytics", Icon: FiBarChart2 },
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
  const notificationMenuRef = useRef(null);
  const notificationTriggerRef = useRef(null);
  const pathRole = getRoleFromPath(location.pathname);
  const [account, setAccount] = useState(getStoredAccount);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
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

  useEffect(() => {
    if (!isNotificationOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!notificationMenuRef.current?.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsNotificationOpen(false);
        notificationTriggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNotificationOpen]);

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await logout();
      toast.success("Signed out", "You have securely signed out of WaterWise.");
    } catch {
      toast.warning("Signed out locally", "The server could not confirm sign-out, but this device session was cleared.");
    } finally {
      setAccount(null);
      setIsNotificationOpen(false);
      setIsLogoutConfirmOpen(false);
      setIsSigningOut(false);
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
    setIsNotificationOpen(false);
    if (notification.actionPath) {
      navigate(notification.actionPath);
      return;
    }
    setSelectedNotification(notification);
  };

  const selectedNotificationPresentation = getNotificationPresentation(
    selectedNotification ?? {},
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header
        accountName={accountName || activeRoleConfig.userName}
        activeRole={activeRole}
        activeRoleLabel={activeRoleConfig.label}
        notificationSlot={
          activeRole === "consumer" ? (
            <div className="relative" ref={notificationMenuRef}>
              <NotificationBadgeTrigger
                buttonRef={notificationTriggerRef}
                isOpen={isNotificationOpen}
                onToggleHub={() => setIsNotificationOpen((isOpen) => !isOpen)}
                unreadCount={unreadCount}
              />
              {isNotificationOpen && (
                <section
                  aria-label="Notifications"
                  className="ww-popover-enter fixed right-3 top-[4.5rem] z-50 flex max-h-[min(70vh,38rem)] w-[calc(100vw-1.5rem)] max-w-[26rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-modal sm:right-6 sm:top-20"
                  id="consumer-notification-popup"
                  role="dialog"
                >
                  <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-4 py-3">
                    <div>
                      <h2 className="text-xl font-extrabold tracking-[-0.03em] text-navy-900">Notifications</h2>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">{unreadCount ? `${unreadCount} unread` : "You’re all caught up"}</p>
                    </div>
                    {unreadCount > 0 && <span className="rounded-full bg-water-50 px-3 py-1 text-xs font-bold text-water-700">New</span>}
                  </header>
                  <NotificationPage
                    isLoading={isNotificationLoading}
                    notifications={notifications}
                    onNotificationClick={handleNotificationClick}
                    onMarkAsRead={handleMarkNotificationAsRead}
                  />
                </section>
              )}
            </div>
          ) : null
        }
        onChangePassword={() => setIsChangePasswordOpen(true)}
        onLogout={() => setIsLogoutConfirmOpen(true)}
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
          accountName={accountName || activeRoleConfig.userName}
          activeRoleLabel={activeRoleConfig.label}
          items={activeRoleConfig.links}
          onChangePassword={() => setIsChangePasswordOpen(true)}
          onLogout={() => setIsLogoutConfirmOpen(true)}
          onProfile={activeRole === "consumer" ? () => navigate("/consumer/profile-details") : undefined}
        />

        <main
          className="ww-workspace min-w-0 flex-1 pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0"
          id="main-content"
        >
          <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            {children}
          </div>
        </main>
      </div>

      <LogoutConfirmationModal
        isOpen={isLogoutConfirmOpen}
        isSigningOut={isSigningOut}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
      />

      {isChangePasswordOpen && (
        <ChangePasswordModal
          isOpen
          onClose={() => setIsChangePasswordOpen(false)}
          onSuccess={(successMessage) => toast.success("Password changed", successMessage)}
        />
      )}

      <Modal
        description={selectedNotificationPresentation.label}
        eyebrow={selectedNotification?.priority === "critical" ? "Urgent update" : "WaterWise notification"}
        isOpen={Boolean(selectedNotification)}
        onClose={() => setSelectedNotification(null)}
        size="sm"
        title={selectedNotification?.title}
      >
        {selectedNotification && (
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                selectedNotification.priority === "critical"
                  ? "bg-red-100 text-red-700"
                  : selectedNotification.priority === "high"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-water-100 text-water-700"
              }`}>
                <selectedNotificationPresentation.Icon aria-hidden="true" className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-6 text-slate-700">{selectedNotification.message}</p>
                <p className="mt-3 text-xs font-semibold text-slate-400">
                  {new Intl.DateTimeFormat("en-PH", {
                    dateStyle: "medium",
                    timeStyle: selectedNotification.createdAt ? "short" : undefined,
                    timeZone: selectedNotification.createdAt ? "Asia/Manila" : "UTC",
                  }).format(new Date(selectedNotification.createdAt ?? `${selectedNotification.date}T00:00:00Z`))}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
              <button
                className="min-h-11 rounded-xl bg-water-600 px-5 text-sm font-bold text-white hover:bg-water-700"
                onClick={() => setSelectedNotification(null)}
                type="button"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
