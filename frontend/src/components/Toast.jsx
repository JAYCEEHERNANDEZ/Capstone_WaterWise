import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Info,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext(null);
const EXIT_ANIMATION_MS = 240;

const toastStyles = {
  error: {
    badge: "border-red-200 bg-red-50 text-red-700",
    border: "border-red-200",
    icon: "bg-red-50 text-red-700",
    Icon: CircleAlert,
    label: "Error",
  },
  info: {
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    border: "border-sky-200",
    icon: "bg-sky-50 text-sky-700",
    Icon: Info,
    label: "Information",
  },
  success: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    border: "border-emerald-200",
    icon: "bg-emerald-50 text-emerald-700",
    Icon: CheckCircle2,
    label: "Success",
  },
  warning: {
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    border: "border-amber-200",
    icon: "bg-amber-50 text-amber-700",
    Icon: AlertTriangle,
    label: "Warning",
  },
};

function createToastId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const exiting = useRef(new Set());
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    if (exiting.current.has(id)) return;
    exiting.current.add(id);
    window.clearTimeout(timers.current.get(id));
    setToasts((current) => current.map((toast) => (
      toast.id === id ? { ...toast, exiting: true } : toast
    )));
    timers.current.set(id, window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      exiting.current.delete(id);
      timers.current.delete(id);
    }, EXIT_ANIMATION_MS));
  }, []);

  const show = useCallback((options) => {
    const type = toastStyles[options.type] ? options.type : "info";
    const id = createToastId();
    const duration = options.duration ?? (type === "error" ? 5000 : 4000);
    const toast = {
      id,
      exiting: false,
      message: options.message ?? "",
      title: options.title || toastStyles[type].label,
      type,
    };

    setToasts((current) => [...current.slice(-3), toast]);
    if (duration > 0) {
      timers.current.set(id, window.setTimeout(() => dismiss(id), duration));
    }
    return id;
  }, [dismiss]);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    exiting.current.clear();
    timers.current.clear();
  }, []);

  const toast = useMemo(() => ({
    dismiss,
    error: (title, message, options = {}) => show({ ...options, message, title, type: "error" }),
    info: (title, message, options = {}) => show({ ...options, message, title, type: "info" }),
    show,
    success: (title, message, options = {}) => show({ ...options, message, title, type: "success" }),
    warning: (title, message, options = {}) => show({ ...options, message, title, type: "warning" }),
  }), [dismiss, show]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {typeof document !== "undefined" && createPortal(
        <div
          aria-label="System notifications"
          className="pointer-events-none fixed inset-x-3 top-[calc(env(safe-area-inset-top)+4.5rem)] z-[100] flex flex-col items-center gap-3 sm:inset-x-auto sm:right-6 sm:top-20 sm:w-[25rem] sm:items-stretch"
        >
          {toasts.map((item) => {
            const { badge, border, icon, Icon, label } = toastStyles[item.type];
            return (
              <div
                aria-atomic="true"
                className={`${item.exiting ? "ww-toast-exit" : "ww-toast-enter"} pointer-events-auto relative w-full max-w-md overflow-hidden rounded-2xl border bg-white shadow-raised ${border}`}
                key={item.id}
                role={item.type === "error" ? "alert" : "status"}
              >
                <div className="flex items-start gap-3 p-4">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${icon}`}>
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] ${badge}`}>
                      {label}
                    </span>
                    <p className="mt-1.5 text-sm font-extrabold leading-5 text-navy-900">{item.title}</p>
                    {item.message && <p className="mt-1 text-sm leading-5 text-slate-600">{item.message}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

// The hook is colocated with the provider so every feature imports one toast API.
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }
  return context;
}

export default ToastProvider;
