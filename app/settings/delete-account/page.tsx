"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const TXT = {
  ar: {
    title: "حذف الحساب",
    intro: "سيتم حذف حسابك وجميع بياناتك نهائياً، ولا يمكن التراجع عن ذلك.",
    listTitle: "ما الذي سيُحذف:",
    items: ["بيانات المتجر والحساب", "العملاء والموردون", "الفواتير والدفعات وديون المشتريات", "الإشعارات وأعضاء الفريق وأجهزة الإشعارات"],
    note: "إذا كان لديك اشتراك مدفوع، فحذف الحساب لا يستردّ المبالغ المدفوعة. تواصل مع الدعم لأي استفسار.",
    needLogin: "سجّل الدخول أولاً لتتمكن من حذف حسابك.",
    login: "تسجيل الدخول",
    password: "كلمة المرور لتأكيد الحذف",
    email: "اكتب بريدك الإلكتروني لتأكيد الحذف",
    button: "حذف حسابي نهائياً",
    deleting: "جارٍ الحذف…",
    wrongPassword: "كلمة المرور غير صحيحة",
    emailMismatch: "البريد الإلكتروني غير مطابق",
    failed: "تعذّر حذف الحساب، حاول مرة أخرى",
    member: "حذف الحساب متاح لمالك المتجر فقط.",
    back: "رجوع",
  },
  en: {
    title: "Delete account",
    intro: "Your account and all your data will be permanently deleted. This cannot be undone.",
    listTitle: "What will be deleted:",
    items: ["Shop and account data", "Customers and suppliers", "Invoices, payments and purchase debts", "Notifications, team members and notification devices"],
    note: "If you have a paid subscription, deleting the account does not refund payments. Contact support with any questions.",
    needLogin: "Please sign in first to delete your account.",
    login: "Sign in",
    password: "Enter your password to confirm",
    email: "Type your email address to confirm",
    button: "Permanently delete my account",
    deleting: "Deleting…",
    wrongPassword: "Incorrect password",
    emailMismatch: "Email does not match",
    failed: "Could not delete the account, please try again",
    member: "Only the shop owner can delete the account.",
    back: "Back",
  },
};

export default function DeleteAccountPage() {
  const { dir } = useTranslation();
  const tx = TXT[dir === "rtl" ? "ar" : "en"];
  const { data: session, status } = useSession();
  const isMember = !!(session?.user as any)?.isMember;
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requires, setRequires] = useState<"password" | "email">("password");
  const needsEmail = requires === "email";

  // Email accounts confirm with their password; Google accounts type their email.
  useEffect(() => {
    if (status !== "authenticated" || isMember) return;
    fetch("/api/users/account")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.requires && setRequires(d.requires))
      .catch(() => {});
  }, [status, isMember]);

  const remove = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/users/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(needsEmail ? { confirmEmail: value } : { password: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await signOut({ callbackUrl: "/" });
        return;
      }
      setError(
        data.error === "WRONG_PASSWORD" ? tx.wrongPassword
        : data.error === "EMAIL_MISMATCH" ? tx.emailMismatch
        : tx.failed
      );
    } catch {
      setError(tx.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir={dir} className="mx-auto max-w-xl px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-3 text-2xl font-black text-slate-950">{tx.title}</h1>
        <p className="mb-4 text-slate-700">{tx.intro}</p>
        <p className="mb-2 font-bold text-slate-900">{tx.listTitle}</p>
        <ul className="mb-4 list-disc space-y-1 ps-6 text-slate-600">
          {tx.items.map((i) => <li key={i}>{i}</li>)}
        </ul>
        <p className="mb-6 text-sm text-slate-500">{tx.note}</p>

        {status === "loading" ? null : !session ? (
          <div>
            <p className="mb-3 text-slate-700">{tx.needLogin}</p>
            <Link href="/login?callbackUrl=/settings/delete-account" className="inline-block rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white">{tx.login}</Link>
          </div>
        ) : isMember ? (
          <p className="text-slate-700">{tx.member}</p>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-800">
              {needsEmail ? tx.email : tx.password}
            </label>
            <input
              type={needsEmail ? "email" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoComplete="off"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
            {error && <p className="text-sm font-bold text-red-600">{error}</p>}
            <button
              onClick={remove}
              disabled={loading || !value}
              className="w-full rounded-xl bg-red-600 px-5 py-3 font-bold text-white disabled:opacity-50"
            >
              {loading ? tx.deleting : tx.button}
            </button>
            <Link href="/dashboard" className="block text-center text-sm text-slate-500">{tx.back}</Link>
          </div>
        )}
      </div>
    </main>
  );
}
