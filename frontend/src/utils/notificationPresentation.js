import {
  FiAlertCircle,
  FiAlertTriangle,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDroplet,
  FiUser,
  FiVolume2,
} from "react-icons/fi";

const presentations = {
  account_status_changed: { Icon: FiUser, label: "Account update" },
  announcement: { Icon: FiVolume2, label: "Community announcement" },
  bill_due_soon: { Icon: FiCalendar, label: "Upcoming due date" },
  bill_due_today: { Icon: FiClock, label: "Bill due today" },
  bill_generated: { Icon: FiDroplet, label: "New meter reading and bill" },
  payment_received: { Icon: FiCheckCircle, label: "Payment received" },
  service_alert: { Icon: FiAlertTriangle, label: "Service alert" },
};

export function getNotificationPresentation(item = {}) {
  const type = String(item.type ?? "announcement").toLowerCase();

  if (type.startsWith("bill_overdue")) {
    return { Icon: FiAlertCircle, label: "Overdue bill" };
  }

  if (presentations[type]) return presentations[type];
  if (item.priority === "critical") {
    return { Icon: FiAlertTriangle, label: "Urgent notification" };
  }
  if (item.category === "bill") {
    return { Icon: FiDroplet, label: "Billing notification" };
  }

  return { Icon: FiBell, label: "Notification" };
}
