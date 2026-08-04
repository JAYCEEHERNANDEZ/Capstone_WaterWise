import { useRef, useState } from "react";
import { CheckCircle2, CircleOff, Eye, EyeOff, Phone, ShieldCheck } from "lucide-react";
import Dropdown from "./Dropdown";

const EMAIL_DOMAIN = "@waterwise.app";

const initialState = {
  accountName: "",
  fullName: "",
  purok: "",
  email: "",
  contactNumber: "",
  status: "active",
};

function createInitialState(initialData) {
  if (!initialData) return initialState;

  const emailLocalPart = String(initialData.email ?? "").split("@")[0];
  return {
    ...initialState,
    ...initialData,
    email: emailLocalPart ? `${emailLocalPart}${EMAIL_DOMAIN}` : "",
  };
}

function isStrongPassword(password) {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function isValidContactNumber(contactNumber) {
  const compactNumber = contactNumber.trim().replace(/[\s()-]/g, "");
  return /^(?:09\d{9}|\+639\d{9})$/.test(compactNumber);
}

function ConsumerForm({ embedded = false, onSubmit = () => {}, requirePassword = false, initialData = null, onCancel }) {
  const formRef = useRef(null);
  const [consumer, setConsumer] = useState(() => createInitialState(initialData));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setConsumer((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  };

  const handleEmailChange = (value) => {
    const localPart = value.replace(/\s/g, "").replace(/@.*$/, "");
    updateField("email", localPart ? `${localPart}${EMAIL_DOMAIN}` : "");
  };

  const validate = () => {
    const validationErrors = {};

    if (!consumer.fullName.trim()) {
      validationErrors.fullName = "Enter the resident's name.";
    }
    if (!consumer.accountName.trim()) {
      validationErrors.accountName = "Enter a username.";
    }
    if (!consumer.purok) {
      validationErrors.purok = "Select the resident's purok.";
    }
    if (!consumer.email.trim()) {
      validationErrors.email = "Enter an email name before @waterwise.app.";
    } else if (!/^[^\s@]+@waterwise\.app$/i.test(consumer.email)) {
      validationErrors.email = "Use a valid @waterwise.app email address.";
    }
    if (!consumer.contactNumber.trim()) {
      validationErrors.contactNumber = "Enter the resident's contact number.";
    } else if (!isValidContactNumber(consumer.contactNumber)) {
      validationErrors.contactNumber = "Enter a valid Philippine mobile number, such as 09171234567.";
    }
    if (requirePassword) {
      if (!password) {
        validationErrors.password = "Enter a password.";
      } else if (!isStrongPassword(password)) {
        validationErrors.password =
          "Password is weak. Try at least 8 characters with uppercase, lowercase, a number, and a symbol.";
      }
    }

    setErrors(validationErrors);
    requestAnimationFrame(() => {
      formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
    });
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const saved = await onSubmit({
      ...consumer,
      ...(requirePassword ? { password } : {}),
    });

    if (saved === false) return;

    setConsumer(initialState);
    setPassword("");
    setShowPassword(false);
    setErrors({});
  };

  const inputClass = (field, extraClasses = "") => [
    "min-h-12 w-full rounded-xl border bg-white px-4 text-navy-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-4",
    errors[field]
      ? "border-red-600 focus:border-red-600 focus:ring-red-100"
      : "border-slate-300 focus:border-water-600 focus:ring-water-100",
    extraClasses,
  ].join(" ");
  const labelClass = "text-sm font-bold text-slate-700";
  const errorClass = "mt-1.5 text-sm font-semibold leading-5 text-red-600";
  const describedBy = (field, helperId) => [errors[field] ? `${field}-error` : "", helperId].filter(Boolean).join(" ") || undefined;

  return (
    <form autoComplete="off" className={embedded ? "bg-white" : "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"} onSubmit={handleSubmit} ref={formRef}>
      {!embedded && <header className="bg-navy-950 p-5 text-white sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-water-900 text-water-300">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-water-300">Resident account</p>
            <h2 className="mt-1 text-2xl font-extrabold">{initialData ? "Edit resident" : "Add resident"}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              {initialData ? "Update the resident's service information." : "Enter the resident's details and create secure sign-in credentials."}
            </p>
          </div>
        </div>
      </header>}

      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="resident-name">Name</label>
          <input
            aria-describedby={describedBy("fullName")}
            aria-invalid={Boolean(errors.fullName)}
            autoComplete="off"
            className={`mt-2 ${inputClass("fullName")}`}
            id="resident-name"
            onChange={(event) => updateField("fullName", event.target.value)}
            placeholder="e.g. Juan Dela Cruz"
            type="text"
            value={consumer.fullName}
          />
          {errors.fullName && <p className={errorClass} id="fullName-error" role="alert">{errors.fullName}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="resident-username">Username</label>
          <input
            aria-describedby={describedBy("accountName")}
            aria-invalid={Boolean(errors.accountName)}
            autoComplete="off"
            className={`mt-2 ${inputClass("accountName")}`}
            id="resident-username"
            onChange={(event) => updateField("accountName", event.target.value)}
            placeholder="e.g. juandelacruz"
            spellCheck="false"
            type="text"
            value={consumer.accountName}
          />
          {errors.accountName && <p className={errorClass} id="accountName-error" role="alert">{errors.accountName}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="purok">Purok</label>
          <Dropdown
            ariaDescribedBy={describedBy("purok")}
            ariaInvalid={Boolean(errors.purok)}
            ariaLabel="Select resident purok"
            className="mt-2"
            id="purok"
            name="purok"
            onValueChange={(value) => updateField("purok", value)}
            options={[1, 2, 3, 4, 5, 6].map((number) => ({
              label: `Purok ${number}`,
              value: `Purok ${number}`,
            }))}
            placeholder="Select purok"
            value={consumer.purok}
          />
          {errors.purok && <p className={errorClass} id="purok-error" role="alert">{errors.purok}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="resident-contact-number">Contact number</label>
          <div className="relative mt-2">
            <Phone aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              aria-describedby={describedBy("contactNumber", "contact-number-helper")}
              aria-invalid={Boolean(errors.contactNumber)}
              autoComplete="tel"
              className={inputClass("contactNumber", "pl-12 font-mono tabular-nums")}
              id="resident-contact-number"
              inputMode="tel"
              maxLength={20}
              onChange={(event) => updateField("contactNumber", event.target.value.replace(/[^\d+\s()-]/g, ""))}
              placeholder="0917 123 4567"
              type="tel"
              value={consumer.contactNumber}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500" id="contact-number-helper">Use an active Philippine mobile number for resident contact.</p>
          {errors.contactNumber && <p className={errorClass} id="contactNumber-error" role="alert">{errors.contactNumber}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="resident-email">Email address</label>
          <div className={`mt-2 flex min-h-12 overflow-hidden rounded-xl border bg-white transition-colors focus-within:ring-4 ${errors.email ? "border-red-600 focus-within:border-red-600 focus-within:ring-red-100" : "border-slate-300 focus-within:border-water-600 focus-within:ring-water-100"}`}>
            <input
              aria-describedby={describedBy("email", "email-helper")}
              aria-invalid={Boolean(errors.email)}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent px-4 text-navy-900 outline-none placeholder:text-slate-400"
              id="resident-email"
              inputMode="email"
              onChange={(event) => handleEmailChange(event.target.value)}
              placeholder="juan.delacruz"
              spellCheck="false"
              type="text"
              value={consumer.email.replace(/@waterwise\.app$/i, "")}
            />
            <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600">
              {EMAIL_DOMAIN}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500" id="email-helper">The WaterWise email domain is added automatically.</p>
          {errors.email && <p className={errorClass} id="email-error" role="alert">{errors.email}</p>}
        </div>

        {requirePassword && (
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="resident-password">Password</label>
            <div className="relative mt-2">
              <input
                aria-describedby={describedBy("password", "password-helper")}
                aria-invalid={Boolean(errors.password)}
                autoComplete="new-password"
                className={inputClass("password", "pr-12")}
                id="resident-password"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((previous) => ({ ...previous, password: "" }));
                }}
                placeholder="Create a strong password"
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-500 transition-colors hover:text-water-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-water-600"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-slate-500" id="password-helper">
              Use 8 or more characters with uppercase, lowercase, a number, and a symbol.
            </p>
            {errors.password && <p className={errorClass} id="password-error" role="alert">{errors.password}</p>}
          </div>
        )}

        {initialData && (
          <div className="sm:col-span-2">
            <div className="flex min-h-20 items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${consumer.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {consumer.status === "active"
                    ? <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                    : <CircleOff aria-hidden="true" className="h-5 w-5" />}
                </span>
                <div>
                  <p className="text-sm font-bold text-navy-900">Account status</p>
                  <p className={`mt-1 text-sm font-semibold ${consumer.status === "active" ? "text-emerald-700" : "text-red-700"}`}>
                    {consumer.status === "active" ? "Active — resident can use the account" : "Inactive — account access is disabled"}
                  </p>
                </div>
              </div>
              <button
                aria-checked={consumer.status === "active"}
                aria-label={`Set resident account ${consumer.status === "active" ? "inactive" : "active"}`}
                className={`relative h-11 w-[4.5rem] shrink-0 rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 focus-visible:ring-offset-2 ${consumer.status === "active" ? "border-emerald-600 bg-emerald-600" : "border-slate-300 bg-slate-300"}`}
                onClick={() => updateField("status", consumer.status === "active" ? "inactive" : "active")}
                role="switch"
                type="button"
              >
                <span className={`absolute left-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform ${consumer.status === "active" ? "translate-x-7" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <button className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 font-bold text-navy-900 transition-colors hover:bg-slate-50" onClick={onCancel} type="button">
              Cancel
            </button>
          )}
          <button className="min-h-12 rounded-xl bg-water-600 px-6 font-bold text-white transition-colors hover:bg-water-700 disabled:opacity-60" type="submit">
            {initialData ? "Update resident" : "Add resident"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default ConsumerForm;
