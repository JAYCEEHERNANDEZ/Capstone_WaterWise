import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import AppLayout from "./components/AppLayout";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import RouteAccessError from "./components/RouteAccessError";
import {
  getStoredAccount as getSessionAccount,
  hasAuthenticatedSession,
} from "./services/authToken";
import BillingLedger from "./pages/BillingLedger";
import ConsumerProfile from "./pages/ConsumerProfile";
import Login from "./pages/Login";
import UsageMetrics from "./pages/UsageMetrics";
import AnalyticsDashboard from "./pages/analyticsDashboard";
import Reports from "./pages/Reports";
import ConsumerManagementPage from "./pages/ConsumerManagementPage";
import AdminReadingsPage from "./pages/AdminReadingsPage";
import BillingManagementPage from "./pages/BillingManagementPage";
import EventManagementPage from "./pages/EventManagementPage";
import AnnouncementManagementPage from "./pages/AnnouncementManagementPage";
import PaymentProcessingPage from "./pages/PaymentProcessingPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import RecordConsumptionPage from "./pages/RecordConsumptionPage";

const portalRoutes = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Residents", path: "/admin/consumers" },
  { label: "Readings", path: "/admin/readings" },
  { label: "Billing", path: "/admin/billings" },
  { label: "Payments", path: "/admin/payments" },
  { label: "Events", path: "/admin/events" },
  { label: "Announcements", path: "/admin/announcements" },
  { label: "Record Consumption Entry", path: "/meter-reader/readings-entry" },
  { label: "Profile", path: "/consumer/profile-details" },
  { label: "Bills", path: "/consumer/billing-ledger" },
  { label: "Home", path: "/consumer/usage-metrics" },
  { label: "Analytics", path: "/admin/analytics" },
  { label: "Reports", path: "/admin/reports" },
];

const roleAccess = {
  admin: {
    homePath: "/admin/dashboard",
    label: "Admin",
    paths: [
      "/admin",
      "/admin/dashboard",
      "/admin/consumers",
      "/admin/readings",
      "/admin/billings",
      "/admin/payments",
      "/admin/events",
      "/admin/announcements",
      "/admin/analytics",
      "/admin/reports",
    ],
  },
  "meter-reader": {
    homePath: "/meter-reader/readings-entry",
    label: "Meter Reader",
    paths: [
      "/meter-reader",
      "/meter-reader/readings-entry",
    ],
  },
  consumer: {
    homePath: "/consumer/usage-metrics",
    label: "Consumer",
    paths: [
      "/consumer",
      "/consumer/profile-details",
      "/consumer/billing-ledger",
      "/consumer/usage-metrics",
    ],
  },
};

function findRouteLabel(pathname) {
  return portalRoutes.find((route) => route.path === pathname)?.label ?? "Dashboard";
}

function MockPortalPage() {
  const location = useLocation();
  const pageTitle = findRouteLabel(location.pathname);

  return (
    <AppLayout>
      <section className="ww-glass-strong rounded-[24px] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0284C7]">
          Mock workspace
        </p>
        <h2 className="mt-3 text-2xl font-bold leading-tight tracking-[-0.02em] text-[#0F172A]">
          {pageTitle}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          This canvas is ready for the {pageTitle.toLowerCase()} page view.
          Data-connected modules can be placed here without changing the shared
          WaterWise layout shell.
        </p>
      </section>
    </AppLayout>
  );
}

function getStoredAccount() {
  if (!hasAuthenticatedSession()) return null;
  const account = getSessionAccount();
  return roleAccess[account?.role] ? account : null;
}

function RoleRouteGuard({ children, requiredRole }) {
  const location = useLocation();
  const account = getStoredAccount();
  const storedRole = account?.role;
  const requestedRole = roleAccess[requiredRole];

  if (!storedRole) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  if (storedRole && storedRole !== requiredRole) {
    return (
      <RouteAccessError
        allowedPath={roleAccess[storedRole].homePath}
        currentRoleLabel={roleAccess[storedRole].label}
        requestedRoleLabel={requestedRole.label}
      />
    );
  }

  if (!requestedRole.paths.includes(location.pathname)) {
    return (
      <RouteAccessError
        allowedPath={requestedRole.homePath}
        currentRoleLabel={requestedRole.label}
        requestedRoleLabel={requestedRole.label}
      />
    );
  }

  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/login" />} path="/" />
      <Route element={<Login />} path="/login" />
      <Route
        element={
          <RoleRouteGuard requiredRole="meter-reader">
            <AppLayout><RecordConsumptionPage /></AppLayout>
          </RoleRouteGuard>
        }
        path="/meter-reader/readings-entry"
      />
      <Route
        element={
          <RoleRouteGuard requiredRole="admin">
            <Navigate replace to="/admin/dashboard" />
          </RoleRouteGuard>
        }
        path="/admin"
      />
      <Route
        path="/admin/dashboard"
        element={
          <RoleRouteGuard requiredRole="admin">
            <AppLayout>
              <AdminDashboardPage />
            </AppLayout>
          </RoleRouteGuard>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <RoleRouteGuard requiredRole="admin">
            <AppLayout>
              <PaymentProcessingPage />
            </AppLayout>
          </RoleRouteGuard>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <RoleRouteGuard requiredRole="admin">
            <AppLayout>
              <AnnouncementManagementPage />
            </AppLayout>
          </RoleRouteGuard>
        }
      />
      <Route
        path="/admin/events"
        element={
          <RoleRouteGuard requiredRole="admin">
            <AppLayout>
              <EventManagementPage />
            </AppLayout>
          </RoleRouteGuard>
        }
      />
      <Route
        path="/admin/billings"
        element={
          <RoleRouteGuard requiredRole="admin">
            <AppLayout>
              <BillingManagementPage />
            </AppLayout>
          </RoleRouteGuard>
        }
      />
      <Route
        path="/admin/readings"
        element={
          <RoleRouteGuard requiredRole="admin">
            <AppLayout>
              <AdminReadingsPage />
            </AppLayout>
          </RoleRouteGuard>
        }
      />
      <Route
        path="/admin/consumers"
        element={
          <RoleRouteGuard requiredRole="admin">
            <AppLayout>
              <ConsumerManagementPage />
            </AppLayout>
          </RoleRouteGuard>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RoleRouteGuard requiredRole="admin">
            <AppLayout>
              <Reports />
            </AppLayout>
          </RoleRouteGuard>
        }
      />
      <Route
              path="/admin/analytics"
              element={
                <RoleRouteGuard requiredRole="admin">
                  <AppLayout>
                    <AnalyticsDashboard />
                  </AppLayout>
                </RoleRouteGuard>
              }
            />
      <Route
        element={
          <RoleRouteGuard requiredRole="admin">
            <MockPortalPage />
          </RoleRouteGuard>
        }
        path="/admin/:section"
      />
      <Route
        element={
          <RoleRouteGuard requiredRole="meter-reader">
            <Navigate replace to="/meter-reader/readings-entry" />
          </RoleRouteGuard>
        }
        path="/meter-reader"
      />
      <Route
        element={
          <RoleRouteGuard requiredRole="meter-reader">
            <MockPortalPage />
          </RoleRouteGuard>
        }
        path="/meter-reader/:section"
      />
      <Route
        element={
          <RoleRouteGuard requiredRole="consumer">
            <Navigate replace to="/consumer/usage-metrics" />
          </RoleRouteGuard>
        }
        path="/consumer"
      />
      <Route
        element={
          <RoleRouteGuard requiredRole="consumer">
            <AppLayout>
              <ConsumerProfile />
            </AppLayout>
          </RoleRouteGuard>
        }
        path="/consumer/profile-details"
      />
      <Route
        element={
          <RoleRouteGuard requiredRole="consumer">
            <AppLayout>
              <BillingLedger />
            </AppLayout>
          </RoleRouteGuard>
        }
        path="/consumer/billing-ledger"
      />
      <Route
        element={
          <RoleRouteGuard requiredRole="consumer">
            <AppLayout>
              <UsageMetrics />
            </AppLayout>
          </RoleRouteGuard>
        }
        path="/consumer/usage-metrics"
      />
      <Route
        element={
          <RoleRouteGuard requiredRole="consumer">
            <MockPortalPage />
          </RoleRouteGuard>
        }
        path="/consumer/:section"
      />
      <Route element={<Navigate replace to="/login" />} path="*" />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <PWAInstallPrompt />
    </BrowserRouter>
  );
}
