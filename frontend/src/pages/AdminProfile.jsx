import { useEffect, useState } from "react";
import { AtSign, KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { getStoredAccount } from "../services/authToken";

export default function AdminProfile() {
  const [account, setAccount] = useState(getStoredAccount);

  useEffect(() => {
    const handleEmailChange = (event) => setAccount((current) => ({ ...current, email: event.detail?.email ?? current.email }));
    window.addEventListener("waterwise:email-changed", handleEmailChange);
    return () => window.removeEventListener("waterwise:email-changed", handleEmailChange);
  }, []);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader description="Review your administrator identity and manage secure account credentials." eyebrow="Administrator account" title="Profile management" />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-4"><span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-water-50 text-water-700"><UserRound className="h-8 w-8" /></span><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-water-700">Administrator</p><h2 className="mt-1 text-2xl font-extrabold text-navy-900">{account?.username ?? account?.name ?? "Administrator"}</h2><p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700"><ShieldCheck className="h-4 w-4" />Active administrator account</p></div></div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-700">Account</p><h2 className="mt-1 text-xl font-extrabold text-navy-900">Account information</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"><AtSign className="h-5 w-5 text-water-700" /><div><p className="text-xs text-slate-500">Username</p><p className="mt-1 font-bold text-navy-900">{account?.username ?? account?.name}</p></div></div><div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"><Mail className="h-5 w-5 text-water-700" /><div className="min-w-0"><p className="text-xs text-slate-500">Email address</p><p className="mt-1 break-all font-bold text-navy-900">{account?.email}</p></div></div></div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-700">Security</p><h2 className="mt-1 text-xl font-extrabold text-navy-900">Profile security</h2><p className="mt-1 text-sm text-slate-600">Security changes are verified through your registered administrator email.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><button className="flex min-h-16 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-water-50" onClick={() => window.dispatchEvent(new CustomEvent("waterwise:open-change-password", { detail: { emailOnly: true } }))} type="button"><KeyRound className="h-5 w-5 text-water-700" /><span><span className="block text-sm font-bold">Change password</span><span className="mt-1 block text-xs text-slate-500">Verify using email OTP only.</span></span></button><button className="flex min-h-16 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-water-50" onClick={() => window.dispatchEvent(new Event("waterwise:open-change-email"))} type="button"><Mail className="h-5 w-5 text-water-700" /><span><span className="block text-sm font-bold">Change email</span><span className="mt-1 block text-xs text-slate-500">Verify your current email first.</span></span></button></div>
      </section>
    </div>
  );
}
