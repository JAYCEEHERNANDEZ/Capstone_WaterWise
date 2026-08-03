import { LoaderCircle, LogOut } from "lucide-react";
import { useRef } from "react";
import Modal from "./Modal";

export default function LogoutConfirmationModal({
  isOpen,
  isSigningOut = false,
  onCancel,
  onConfirm,
}) {
  const cancelButtonRef = useRef(null);

  return (
    <Modal
      ariaLabel="Sign out confirmation"
      className="max-w-md"
      closeOnOverlay={!isSigningOut}
      dismissible={!isSigningOut}
      initialFocusRef={cancelButtonRef}
      isOpen={isOpen}
      onClose={onCancel}
      showCloseButton={false}
      showHeader={false}
      size="sm"
    >
      <div aria-busy={isSigningOut} className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
            <LogOut aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0 pt-0.5">
            <h2 className="text-xl font-extrabold tracking-[-0.03em] text-navy-900">Sign out?</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Are you sure you want to sign out?</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-navy-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 focus-visible:ring-offset-2 disabled:opacity-60"
            disabled={isSigningOut}
            onClick={onCancel}
            ref={cancelButtonRef}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-bold text-white transition-colors hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:bg-red-400"
            disabled={isSigningOut}
            onClick={onConfirm}
            type="button"
          >
            {isSigningOut ? (
              <>
                <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                Signing out…
              </>
            ) : (
              <>
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Sign out
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
