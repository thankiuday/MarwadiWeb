import { HiOutlinePrinter } from 'react-icons/hi2';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';

const BASE_URL = import.meta.env.VITE_APP_URL || 'https://marwadiweb.onrender.com';

const tables = [
  { number: 1, url: `${BASE_URL}/table/1` },
  { number: 2, url: `${BASE_URL}/table/2` },
  { number: 3, url: `${BASE_URL}/table/3` },
];

export default function QRCodesPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <AdminHeader title="Table QR Codes" />
      <div className="min-h-screen bg-slate-50/80 pb-8 sm:pb-10">
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-6">
            <p className="text-slate-600 text-sm sm:text-base mb-4">
              Scan a QR code to order from that table. The table number is saved automatically when customers place orders.
            </p>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors print:hidden"
            >
              <HiOutlinePrinter className="w-5 h-5" />
              Print QR Codes
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {tables.map(({ number, url }) => (
              <div
                key={number}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center print:break-inside-avoid"
              >
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <img
                    src={`/qr-codes/table-${number}.png`}
                    alt={`Table ${number} QR Code`}
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">Table {number}</p>
                  <p className="text-xs text-slate-500 mt-1 font-mono truncate max-w-[200px] mx-auto" title={url}>
                    {url}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-slate-500 print:hidden">
            <p>Place each QR code on the corresponding table. Customers scan to order.</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          aside, footer, nav, button { display: none !important; }
          main { margin-left: 0 !important; }
        }
      `}</style>
    </AdminLayout>
  );
}
