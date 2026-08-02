/* eslint-disable react-hooks/immutability */
// app/team/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

type Member = {
  _id:       string;
  name:      string;
  email:     string;
  role:      "admin" | "member";
  status:    "pending" | "active" | "disabled";
  createdAt: string;
};

const statusLabel: Record<string, { label: string; classes: string }> = {
  pending:  { label: "في الانتظار", classes: "bg-amber-100 text-amber-700"    },
  active:   { label: "نشط",         classes: "bg-emerald-100 text-emerald-700" },
  disabled: { label: "معطّل",        classes: "bg-slate-100 text-slate-600"    },
};

export default function TeamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [members,    setMembers]    = useState<Member[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviting,   setInviting]   = useState(false);

  const [inviteName,  setInviteName]  = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole,  setInviteRole]  = useState<"admin" | "member">("member");

  const plan = (session?.user as any)?.plan || "free";

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id)  { router.replace("/login");   return; }
    if (plan !== "pro")      { router.replace("/pricing"); return; }
    fetchMembers();
  }, [status, session]);

  const fetchMembers = async () => {
    try {
      const res  = await fetch("/api/team", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMembers(data.members || []);
    } catch (err: any) {
      toast.error(err.message || "فشل جلب الأعضاء");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) { toast.error("الاسم والبريد الإلكتروني مطلوبان"); return; }
    setInviting(true);
    try {
      const res  = await fetch("/api/team", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: inviteName, email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`تم إرسال الدعوة إلى ${inviteEmail}`);
      setShowInvite(false);
      setInviteName(""); setInviteEmail(""); setInviteRole("member");
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || "فشل إرسال الدعوة");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      toast.success("تم تحديث الدور");
      setMembers(prev => prev.map(m => m._id === memberId ? { ...m, role: role as any } : m));
    } catch { toast.error("فشل تحديث الدور"); }
  };

  const handleToggleStatus = async (member: Member) => {
    const newStatus = member.status === "disabled" ? "active" : "disabled";
    try {
      const res = await fetch(`/api/team/${member._id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(newStatus === "disabled" ? "تم تعطيل العضو" : "تم تفعيل العضو");
      setMembers(prev => prev.map(m => m._id === member._id ? { ...m, status: newStatus } : m));
    } catch { toast.error("فشل تحديث الحالة"); }
  };

  const handleDelete = async (member: Member) => {
  toast(`هل أنت متأكد من حذف "${member.name}"؟`, {
    action: {
      label: "حذف",
      onClick: async () => {
        try {
          const res = await fetch(`/api/team/${member._id}`, {
            method: "DELETE",
          });

          if (!res.ok) throw new Error();

          toast.success("تم حذف العضو");

          setMembers((prev) =>
            prev.filter((m) => m._id !== member._id)
          );
        } catch {
          toast.error("فشل حذف العضو");
        }
      },
    },

    cancel: {
      label: "إلغاء",
      onClick: () => {},
    },
  });
};

  if (loading || status === "loading") {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white px-6 py-5 text-center shadow-xl">
          <div className="mx-auto mb-3 h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm sm:text-lg font-bold text-slate-800">جاري التحميل...</p>
        </div>
      </main>
    );
  }

  const activeCount  = members.filter(m => m.status === "active").length;
  const pendingCount = members.filter(m => m.status === "pending").length;

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-slate-50 py-4 sm:py-6 lg:py-10 text-slate-900">
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 h-72 w-72 rounded-full bg-purple-100/40 blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-5xl px-3 sm:px-6">

        {/* ── HEADER ── */}
        <section className="mb-4 sm:mb-6 lg:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
          <div className="relative p-4 sm:p-6 lg:p-10">
            <div className="absolute left-0 top-0 h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 rounded-br-[2rem] lg:rounded-br-[4rem] bg-blue-50" />
            <div className="absolute bottom-0 right-0 h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 rounded-tl-[2rem] lg:rounded-tl-[4rem] bg-purple-50" />
            <div className="relative flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">الفريق</span>
                  <span className="inline-flex rounded-full bg-purple-100 px-3 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-xs font-black text-purple-700">PRO ✦</span>
                </div>
                <h1 className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight text-slate-950">
                  إدارة الفريق
                </h1>
                <p className="mt-1 sm:mt-2 lg:mt-3 text-xs sm:text-base lg:text-lg leading-relaxed text-slate-600">
                  ادعُ أعضاء للعمل معك. يمكنك إضافة حتى <strong>5 أعضاء</strong>.
                </p>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-5 py-2.5 sm:py-4 text-xs sm:text-base font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  ← العودة
                </Link>
                <button
                  onClick={() => setShowInvite(true)}
                  disabled={members.filter(m => m.status !== "disabled").length >= 5}
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-blue-600 px-3 sm:px-6 py-2.5 sm:py-4 text-xs sm:text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="text-sm sm:text-xl">+</span> دعوة عضو
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="mb-4 sm:mb-6 lg:mb-8 grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { label: "إجمالي الأعضاء", value: members.length, icon: "👥", color: "blue"    },
            { label: "نشطون",           value: activeCount,    icon: "✅", color: "emerald" },
            { label: "في الانتظار",     value: pendingCount,   icon: "⏳", color: "amber"   },
          ].map(s => (
            <div key={s.label} className="rounded-xl sm:rounded-2xl lg:rounded-[1.75rem] border border-slate-200 bg-white p-3 sm:p-5 lg:p-6 shadow-sm">
              <div className="mb-2 sm:mb-3 lg:mb-4 text-xl sm:text-2xl lg:text-3xl">{s.icon}</div>
              <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-500">{s.label}</p>
              <h2 className={`mt-1 sm:mt-1.5 lg:mt-2 text-xl sm:text-2xl lg:text-3xl font-black text-${s.color}-700`}>
                {s.value}
              </h2>
            </div>
          ))}
        </section>

        {/* ── MEMBERS LIST ── */}
        <section className="overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
          <div className="border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-5">
            <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-950">أعضاء الفريق</h2>
            <p className="mt-0.5 text-[10px] sm:text-sm text-slate-500">{members.length} / 5 أعضاء</p>
          </div>

          {members.length === 0 ? (
            <div className="px-4 sm:px-6 py-12 sm:py-16 lg:py-20 text-center">
              <div className="mb-3 sm:mb-4 text-4xl sm:text-5xl">👥</div>
              <p className="text-sm sm:text-lg font-bold text-slate-700">لا يوجد أعضاء بعد</p>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">ابدأ بدعوة أول عضو في فريقك</p>
              <button
                onClick={() => setShowInvite(true)}
                className="mt-4 sm:mt-6 inline-flex rounded-xl sm:rounded-2xl bg-blue-600 px-5 sm:px-8 py-2.5 sm:py-4 text-xs sm:text-base font-bold text-white transition hover:bg-blue-700"
              >
                دعوة عضو الآن
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {members.map(member => (
                <div
                  key={member._id}
                  className={`p-3 sm:p-4 lg:p-5 transition ${member.status === "disabled" ? "opacity-60" : ""}`}
                >
                  {/* ── Mobile layout (< sm) ── */}
                  <div className="flex items-start justify-between gap-3 sm:hidden">
                    {/* Avatar + info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-base font-black text-blue-700">
                        {member.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{member.email}</p>
                      </div>
                    </div>
                    {/* Status badge */}
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black ${statusLabel[member.status].classes}`}>
                      {statusLabel[member.status].label}
                    </span>
                  </div>

                  {/* Actions row — mobile */}
                  <div className="mt-2.5 flex items-center gap-1.5 sm:hidden flex-wrap">
                    <select
                      value={member.role}
                      onChange={e => handleRoleChange(member._id, e.target.value)}
                      disabled={member.status === "pending"}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-700 outline-none disabled:opacity-50"
                    >
                      <option value="member">عضو</option>
                      <option value="admin">مدير</option>
                    </select>
                    {member.status !== "pending" && (
                      <button
                        onClick={() => handleToggleStatus(member)}
                        className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${member.status === "active" ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"}`}
                      >
                        {member.status === "active" ? "تعطيل" : "تفعيل"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(member)}
                      className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 transition hover:bg-red-100"
                    >
                      حذف
                    </button>
                  </div>

                  {/* ── Tablet/Desktop layout (≥ sm) ── */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
                    {/* Avatar + info */}
                    <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                      <div className="flex h-10 w-10 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-xl lg:rounded-2xl bg-blue-50 text-base lg:text-xl font-black text-blue-700">
                        {member.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm lg:text-base font-bold text-slate-900">{member.name}</p>
                        <p className="text-xs lg:text-sm text-slate-500 truncate">{member.email}</p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
                      <span className={`rounded-full px-2.5 lg:px-3 py-1 text-[10px] lg:text-xs font-black ${statusLabel[member.status].classes}`}>
                        {statusLabel[member.status].label}
                      </span>
                      <select
                        value={member.role}
                        onChange={e => handleRoleChange(member._id, e.target.value)}
                        disabled={member.status === "pending"}
                        className="rounded-lg lg:rounded-xl border border-slate-200 bg-slate-50 px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-bold text-slate-700 outline-none disabled:opacity-50"
                      >
                        <option value="member">عضو</option>
                        <option value="admin">مدير</option>
                      </select>
                      {member.status !== "pending" && (
                        <button
                          onClick={() => handleToggleStatus(member)}
                          className={`rounded-lg lg:rounded-xl px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-bold transition ${
                            member.status === "active"
                              ? "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {member.status === "active" ? "تعطيل" : "تفعيل"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(member)}
                        className="rounded-lg lg:rounded-xl bg-red-50 px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-bold text-red-600 transition hover:bg-red-100"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── INFO BOX ── */}
        <section className="mt-4 sm:mt-5 lg:mt-6 rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-blue-100 bg-blue-50 p-4 sm:p-5 lg:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="text-2xl sm:text-3xl">💡</span>
            <div>
              <p className="text-xs sm:text-sm lg:text-base font-bold text-blue-800">كيف يعمل نظام الفريق؟</p>
              <ul className="mt-1.5 sm:mt-2 space-y-1 text-[10px] sm:text-xs lg:text-sm leading-relaxed text-blue-700">
                <li>• <strong>مدير</strong> — يقدر يضيف عملاء، فواتير، ومدفوعات</li>
                <li>• <strong>عضو</strong> — يقدر يشوف البيانات فقط بدون تعديل</li>
                <li>• الدعوة صالحة لمدة <strong>48 ساعة</strong></li>
                <li>• يمكنك تعطيل أي عضو في أي وقت</li>
              </ul>
            </div>
          </div>
        </section>

      </div>

      {/* ── INVITE MODAL ── */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 lg:p-8 shadow-2xl">
            <div className="mb-5 sm:mb-6 text-center">
              <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-blue-50 text-3xl sm:text-4xl">
                📩
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-950">دعوة عضو جديد</h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">سيصله إيميل بالدعوة لينضم لفريقك</p>
            </div>

            <form onSubmit={handleInvite} className="space-y-3 sm:space-y-4">
              <div>
                <label className="mb-1.5 block text-xs sm:text-sm font-bold text-slate-600">الاسم</label>
                <input
                  type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} required
                  placeholder="اسم العضو"
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 sm:py-3.5 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs sm:text-sm font-bold text-slate-600">البريد الإلكتروني</label>
                <input
                  type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required
                  placeholder="email@example.com"
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 sm:py-3.5 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs sm:text-sm font-bold text-slate-600">الدور</label>
                <select
                  value={inviteRole} onChange={e => setInviteRole(e.target.value as any)}
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 sm:py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="member">عضو — يشوف البيانات فقط</option>
                  <option value="admin">مدير — يضيف ويعدّل</option>
                </select>
              </div>

              <div className="flex gap-2 sm:gap-3 pt-1">
                <button
                  type="submit" disabled={inviting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-blue-600 py-3 sm:py-3.5 lg:py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {inviting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : "📩"}
                  إرسال الدعوة
                </button>
                <button
                  type="button" onClick={() => setShowInvite(false)}
                  className="rounded-xl sm:rounded-2xl bg-slate-100 px-5 sm:px-6 py-3 sm:py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}