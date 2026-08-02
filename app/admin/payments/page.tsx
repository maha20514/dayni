"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type PaymentReq = {
  _id:       string;
  plan:      "basic" | "pro";
  amount:    number;
  status:    "pending" | "approved" | "rejected";
  transferRef: string;
  notes:     string;
  proofImage: string | null;
  createdAt: string;
  userId:    { shopName: string; email: string; plan: string } | string;
};

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || "";

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [requests, setRequests] = useState<PaymentReq[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [secret,   setSecret]   = useState(ADMIN_SECRET);
  const [authed,   setAuthed]   = useState(false);
  const [preview,  setPreview]  = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) { router.replace("/login"); return; }
  }, [status, session]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment-requests/admin", {
        headers: { "x-admin-secret": secret },
      });
      if (res.status === 401) { toast.error("كلمة المرور غير صحيحة"); return; }
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
      setAuthed(true);
    } catch { toast.error("خطأ في الاتصال"); } finally { setLoading(false); }
  };

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/payment-requests/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body:    JSON.stringify({ status: action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(action === "approved" ? "تم تفعيل الخطة ✅" : "تم رفض الطلب");
      fetchRequests();
    } catch (err: any) { toast.error(err.message || "حدث خطأ"); }
  };

  if (!authed) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl text-center">
          <div className="mb-4 text-4xl">🔐</div>
          <h1 className="text-lg font-bold text-slate-900 mb-4">لوحة الإدارة</h1>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="كلمة مرور الإدارة"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 mb-3"
          />
          <button
            onClick={fetchRequests}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            دخول ←
          </button>
        </div>
      </main>
    );
  }

  const pending  = requests.filter(r => r.status === "pending");
  const reviewed = requests.filter(r => r.status !== "pending");

  return (
    <main dir="rtl" className="relative min-h-screen bg-slate-50 py-6 sm:py-10 px-3 sm:px-6 text-slate-900">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950">طلبات الدفع 💳</h1>
            <p className="mt-1 text-sm text-slate-500">{pending.length} طلب في الانتظار</p>
          </div>
          <button onClick={fetchRequests} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
            تحديث 🔄
          </button>
        </div>

        {/* Pending */}
        {pending.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-base font-bold text-amber-700">⏳ بانتظار المراجعة ({pending.length})</h2>
            <div className="space-y-4">
              {pending.map((r) => (
                <RequestCard
                  key={r._id}
                  request={r}
                  onApprove={() => handleAction(r._id, "approved")}
                  onReject={() => handleAction(r._id, "rejected")}
                  onPreview={(img) => setPreview(img)}
                />
              ))}
            </div>
          </section>
        )}

        {pending.length === 0 && (
          <div className="mb-8 rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
            <div className="mb-2 text-4xl">✅</div>
            <p className="font-bold text-slate-700">لا توجد طلبات معلقة</p>
          </div>
        )}

        {/* Reviewed */}
        {reviewed.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-bold text-slate-600">السابقة ({reviewed.length})</h2>
            <div className="space-y-3">
              {reviewed.map((r) => (
                <RequestCard
                  key={r._id}
                  request={r}
                  onPreview={(img) => setPreview(img)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Image preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreview(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="إيصال" className="max-h-[80vh] max-w-full rounded-2xl" />
        </div>
      )}
    </main>
  );
}

function RequestCard({
  request,
  onApprove,
  onReject,
  onPreview,
}: {
  request: PaymentReq;
  onApprove?: () => void;
  onReject?:  () => void;
  onPreview:  (img: string) => void;
}) {
  const user = typeof request.userId === "object" ? request.userId : null;
  const isPending = request.status === "pending";

  return (
    <div className={`rounded-2xl border bg-white p-4 sm:p-5 shadow-sm transition ${
      isPending ? "border-amber-200" : request.status === "approved" ? "border-emerald-200 opacity-80" : "border-red-200 opacity-70"
    }`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          {/* User info */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-base font-black text-blue-700">
              {user?.shopName?.[0] || "؟"}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{user?.shopName || "متجر"}</p>
              <p className="text-xs text-slate-500">{user?.email || "—"}</p>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className={`rounded-full px-3 py-1 font-black ${
              request.plan === "pro" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
            }`}>
              {request.plan === "pro" ? "احترافي" : "أساسي"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-700">
              {request.amount} ريال
            </span>
            <span className={`rounded-full px-3 py-1 font-bold ${
              isPending ? "bg-amber-100 text-amber-700" :
              request.status === "approved" ? "bg-emerald-100 text-emerald-700" :
              "bg-red-100 text-red-700"
            }`}>
              {isPending ? "⏳ انتظار" : request.status === "approved" ? "✅ موافق" : "❌ مرفوض"}
            </span>
          </div>

          {request.transferRef && (
            <p className="mt-2 text-xs text-slate-500">مرجع التحويل: <span className="font-bold text-slate-700">{request.transferRef}</span></p>
          )}
          {request.notes && (
            <p className="mt-1 text-xs text-slate-500">ملاحظات: {request.notes}</p>
          )}
          <p className="mt-1 text-[10px] text-slate-400">
            {new Date(request.createdAt).toLocaleString("ar-SA")}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          {request.proofImage && (
            <button
              onClick={() => onPreview(request.proofImage!)}
              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
            >
              📸 الإيصال
            </button>
          )}
          {isPending && onApprove && onReject && (
            <>
              <button
                onClick={onApprove}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
              >
                ✅ موافقة
              </button>
              <button
                onClick={onReject}
                className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
              >
                ❌ رفض
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}