import CustomersPage from "../customers/page";

export default function Hero() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 text-blue-600 rounded-3xl mb-8">
            📊 
          </div>
          
          <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            مرحبًا بك في نظام إدارة الديون
          </h1>
          
          <p className="text-2xl text-slate-600 mb-12">
            إدارة العملاء والفواتير والمدفوعات بكل سهولة واحترافية
          </p>

          <div className="bg-white rounded-3xl shadow-xl p-2 inline-block">
            <CustomersPage />
          </div>
        </div>
      </div>
    </div>
  );
}