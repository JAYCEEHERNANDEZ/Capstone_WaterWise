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
      validationErrors.accountName = "Account Name is required.";
    }

    if (!consumer.fullName.trim()) {
      validationErrors.fullName = "Full Name is required.";
    }

    if (!consumer.purok) {
      validationErrors.purok = "Purok is required.";
    }

    if (!consumer.email.trim()) {
      validationErrors.email = "Email Address is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(consumer.email)) {
        validationErrors.email = "Invalid email address.";
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

  const inputClass = "mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100";
  const inputErrorClass = "mt-2 w-full rounded-xl border border-red-300 p-3 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100";
  const labelClass = "text-sm font-bold text-slate-700";
  const errorClass = "mt-1 text-sm font-semibold text-red-600";

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <header className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">Registration</p>
        <h2 className="mt-2 text-2xl font-extrabold">{initialData ? "Edit Consumer" : "New Consumer"}</h2>
        <p className="mt-2 text-sm text-slate-300">{initialData ? "Update this water service account." : "Register a new water service account."}</p>
      </header>

      <div className="space-y-5 p-6 sm:p-8">
        <div>
          <label className={labelClass} htmlFor="accountName">Account Name</label>
          <input className={errors.accountName ? inputErrorClass : inputClass} id="accountName" name="accountName" onChange={handleChange} placeholder="e.g. Household account" type="text" value={consumer.accountName} />
          {errors.accountName && <p className={errorClass} role="alert">{errors.accountName}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="fullName">Full Name</label>
          <input className={errors.fullName ? inputErrorClass : inputClass} id="fullName" name="fullName" onChange={handleChange} placeholder="e.g. Juan Dela Cruz" type="text" value={consumer.fullName} />
          {errors.fullName && <p className={errorClass} role="alert">{errors.fullName}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="purok">Purok</label>
          <select className={errors.purok ? inputErrorClass : inputClass} id="purok" name="purok" onChange={handleChange} value={consumer.purok}>
            <option value="">Select Purok</option>
            <option value="Purok 1">Purok 1</option>
            <option value="Purok 2">Purok 2</option>
            <option value="Purok 3">Purok 3</option>
            <option value="Purok 4">Purok 4</option>
            <option value="Purok 5">Purok 5</option>
            <option value="Purok 6">Purok 6</option>
          </select>
          {errors.purok && <p className={errorClass} role="alert">{errors.purok}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="email">Email Address</label>
          <input className={errors.email ? inputErrorClass : inputClass} id="email" name="email" onChange={handleChange} placeholder="e.g. juan@example.com" type="text" value={consumer.email} />
          {errors.email && <p className={errorClass} role="alert">{errors.email}</p>}
        </div>

        {requirePassword && (
          <div>
            <label className={labelClass} htmlFor="password">Temporary Password</label>
            <input className={errors.password ? inputErrorClass : inputClass} id="password" name="password" onChange={({ target }) => { setPassword(target.value); setErrors((prev) => ({ ...prev, password: "" })); }} placeholder="Set a temporary password" type="password" value={password} />
            {errors.password && <p className={errorClass} role="alert">{errors.password}</p>}
          </div>
        )}

        <div className="flex gap-3">
          <button className="flex-1 rounded-xl bg-sky-600 px-5 py-3 font-bold text-white transition hover:bg-sky-700 disabled:opacity-60" type="submit">{initialData ? "Update Consumer" : "Save Consumer"}</button>
          {onCancel && <button className="rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700" onClick={onCancel} type="button">Cancel</button>}
        </div>
      </div>
    </form>
  );
}

export default ConsumerForm;
