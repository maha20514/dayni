/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";

async function getCustomer(id: string) {
  if (!id) return null;

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:3000`);

    const res = await fetch(`${baseUrl}/api/customers/${id}`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      console.error(`API error: ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
}

export default async function CustomerDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await getCustomer(id);

  if (!customer) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-3xl font-bold text-red-600">العميل غير موجود</h2>
        <p className="text-slate-500 mt-4">يرجى التحقق من الرابط أو المحاولة مرة أخرى</p>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-10">
      {/* معلومات العميل */}
      <div className="card p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">{customer.name}</h1>
          <p className="text-xl text-slate-500 mt-2 flex items-center gap-3">
            📱 {customer.phone}
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-sm font-medium text-slate-500">الرصيد الحالي</p>
          <p className="text-5xl font-bold text-red-600 mt-1">
            {Number(customer.totalDebt || 0).toLocaleString()}{" "}
            <span className="text-3xl">ريال</span>
          </p>
        </div>
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex flex-wrap gap-4">
        <Link
          href={`/customers/${customer._id}/invoice`}
          className="btn-primary text-lg flex-1 md:flex-none justify-center py-4"
        >
          📄 إصدار فاتورة جديدة
        </Link>
        <Link
          href={`/customers/${customer._id}/payment`}
          className="btn-success text-lg flex-1 md:flex-none justify-center py-4"
        >
          💰 تسجيل دفعة
        </Link>
      </div>

      {/* سجل العمليات */}
      <div className="card p-8">
        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
          📋 سجل العمليات
        </h3>

        {customer.transactions?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>النوع</th>
                  <th>الوصف</th>
                  <th className="text-right">المبلغ</th>
                  <th className="w-28"></th>
                </tr>
              </thead>
              <tbody>
               {customer.transactions.map((t: any) => {
                  const isPayment = t.type === "سند" || t.type === "دفعة";
                  return (
                    <tr key={t._id} className="hover:bg-slate-50">
                      <td className="font-medium text-slate-600">
                        {new Date(t.date).toLocaleDateString("ar-SA")}
                      </td>
                      <td>
                        <span
                          className={`inline-block px-5 py-1.5 rounded-2xl text-sm font-medium ${
                            isPayment
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="text-slate-600 max-w-xs truncate">
                        {t.description || "-"}
                      </td>
                      <td className={`font-bold text-lg text-right ${
                        isPayment ? "text-emerald-600" : "text-red-600"
                      }`}>
                        {isPayment ? "-" : "+"}
                        {Number(t.amount || 0).toLocaleString()} ريال
                      </td>
                      <td className="text-right">
                        <Link
                          href={isPayment ? `/payments/${t._id}` : `/invoices/${t._id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                        >
                          طباعة
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-slate-500 py-12 text-xl">
            لا توجد عمليات بعد
          </p>
        )}
      </div>
    </div>
  );
}