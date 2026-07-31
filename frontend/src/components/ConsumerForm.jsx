import { useState } from "react";

const initialState = {
  accountName: "",
  fullName: "",
  purok: "",
  email: "",
};

function ConsumerForm({ onSubmit = () => {}, requirePassword = false, initialData = null, onCancel }) {
  const [consumer, setConsumer] = useState(() => initialData ? { ...initialState, ...initialData } : initialState);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = ({ target }) => {
    const { name, value } = target;

    setConsumer((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const validationErrors = {};

    if (!consumer.accountName.trim()) {
      validationErrors.accountName = "Enter an account name.";
    }

    if (!consumer.fullName.trim()) {
      validationErrors.fullName = "Enter the resident's full name.";
    }

    if (!consumer.purok) {
      validationErrors.purok = "Select the resident's purok.";
    }

    if (!consumer.email.trim()) {
      validationErrors.email = "Enter the resident's email address.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(consumer.email)) {
        validationErrors.email = "Enter a valid email address.";
      }
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    if (requirePassword && !password) {
      setErrors({ password: "Password is required." });
      return;
    }

    const saved = await onSubmit({
      ...consumer,
      ...(requirePassword ? { password } : {}),
    });

    if (saved === false) return;

    setConsumer(initialState);
    setPassword("");
    setErrors({});
  };

  const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-navy-900 outline-none transition-colors focus:border-water-600 focus:ring-4 focus:ring-water-100";
  const inputErrorClass = "mt-2 min-h-12 w-full rounded-xl border border-red-600 bg-white px-4 text-navy-900 outline-none transition-colors focus:border-red-600 focus:ring-4 focus:ring-red-100";
  const labelClass = "text-sm font-bold text-slate-700";
  const errorClass = "mt-1 text-sm font-semibold text-red-600";

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <header className="bg-navy-950 p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-water-300">Registration</p>
        <h2 className="mt-2 text-2xl font-extrabold">{initialData ? "Edit resident" : "Add resident"}</h2>
        <p className="mt-2 text-sm text-slate-300">{initialData ? "Update this water service account." : "Register a new water service account."}</p>
      </header>

      <div className="space-y-5 p-6 sm:p-8">
        <div>
          <label className={labelClass} htmlFor="accountName">Account Name</label>
          <input aria-describedby={errors.accountName ? "accountName-error" : undefined} aria-invalid={Boolean(errors.accountName)} className={errors.accountName ? inputErrorClass : inputClass} id="accountName" name="accountName" onChange={handleChange} placeholder="e.g. Household account" type="text" value={consumer.accountName} />
          {errors.accountName && <p className={errorClass} id="accountName-error" role="alert">{errors.accountName}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="fullName">Full Name</label>
          <input aria-describedby={errors.fullName ? "fullName-error" : undefined} aria-invalid={Boolean(errors.fullName)} className={errors.fullName ? inputErrorClass : inputClass} id="fullName" name="fullName" onChange={handleChange} placeholder="e.g. Juan Dela Cruz" type="text" value={consumer.fullName} />
          {errors.fullName && <p className={errorClass} id="fullName-error" role="alert">{errors.fullName}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="purok">Purok</label>
          <select aria-describedby={errors.purok ? "purok-error" : undefined} aria-invalid={Boolean(errors.purok)} className={errors.purok ? inputErrorClass : inputClass} id="purok" name="purok" onChange={handleChange} value={consumer.purok}>
            <option value="">Select Purok</option>
            <option value="Purok 1">Purok 1</option>
            <option value="Purok 2">Purok 2</option>
            <option value="Purok 3">Purok 3</option>
            <option value="Purok 4">Purok 4</option>
            <option value="Purok 5">Purok 5</option>
            <option value="Purok 6">Purok 6</option>
          </select>
          {errors.purok && <p className={errorClass} id="purok-error" role="alert">{errors.purok}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="email">Email Address</label>
          <input aria-describedby={errors.email ? "email-error" : undefined} aria-invalid={Boolean(errors.email)} className={errors.email ? inputErrorClass : inputClass} id="email" inputMode="email" name="email" onChange={handleChange} placeholder="e.g. juan@example.com" type="email" value={consumer.email} />
          {errors.email && <p className={errorClass} id="email-error" role="alert">{errors.email}</p>}
        </div>

        {requirePassword && (
          <div>
            <label className={labelClass} htmlFor="password">Temporary Password</label>
            <input aria-describedby={errors.password ? "password-error" : undefined} aria-invalid={Boolean(errors.password)} className={errors.password ? inputErrorClass : inputClass} id="password" name="password" onChange={({ target }) => { setPassword(target.value); setErrors((prev) => ({ ...prev, password: "" })); }} placeholder="Set a temporary password" type="password" value={password} />
            {errors.password && <p className={errorClass} id="password-error" role="alert">{errors.password}</p>}
          </div>
        )}

        <div className="flex gap-3">
          <button className="min-h-12 flex-1 rounded-xl bg-water-600 px-5 font-bold text-white transition-colors hover:bg-water-700 disabled:opacity-60" type="submit">{initialData ? "Update resident" : "Add resident"}</button>
          {onCancel && <button className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 font-bold text-navy-900 hover:bg-slate-50" onClick={onCancel} type="button">Cancel</button>}
        </div>
      </div>
    </form>
  );
}

export default ConsumerForm;
