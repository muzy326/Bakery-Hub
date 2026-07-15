import { useState, useEffect } from "react";
import { RefreshCw, PackageOpen, ChefHat, Calendar, Tag, Users, DollarSign } from "lucide-react";

interface BulkOrder {
  id: string; userId: string | null; name: string; email: string; phone: string;
  items: { itemId: string; name: string; quantity: number }[];
  pickupDate: string; notes: string; createdAt: string;
  status: "pending" | "confirmed" | "ready" | "completed" | "cancelled";
  discountApplied: boolean; discountPercent: number; subtotal: number; total: number;
}
interface CateringReq {
  id: string; userId: string | null; name: string; email: string; phone: string;
  eventType: string; eventDate: string; guestCount: number; requirements: string;
  budget: string; createdAt: string; status: string;
}

const BULK_STATUSES = ["pending","confirmed","ready","completed","cancelled"];
const CAT_STATUSES  = ["pending","confirmed","completed","cancelled"];

const statusColors: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  ready:     "bg-green-100 text-green-800 border-green-200",
  completed: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

async function patchBulkStatus(id: string, status: string) {
  await fetch(`/api/admin/orders/bulk/${id}/status`, { method: "PATCH", headers: {"Content-Type":"application/json"}, credentials:"include", body: JSON.stringify({ status }) });
}
async function patchCatStatus(id: string, status: string) {
  await fetch(`/api/admin/orders/catering/${id}/status`, { method: "PATCH", headers: {"Content-Type":"application/json"}, credentials:"include", body: JSON.stringify({ status }) });
}

export default function AdminOrders() {
  const [tab, setTab] = useState<"bulk"|"catering">("bulk");
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([]);
  const [catering, setCatering] = useState<CateringReq[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/orders", { credentials: "include" });
    const data = await res.json() as { bulkOrders: BulkOrder[]; cateringRequests: CateringReq[] };
    setBulkOrders(data.bulkOrders);
    setCatering(data.cateringRequests);
    setLoading(false);
  };
  useEffect(() => { fetchOrders(); }, []);

  const stats = [
    { label: "Total Bulk Orders", value: bulkOrders.length, icon: PackageOpen, color: "text-blue-600" },
    { label: "Pending", value: bulkOrders.filter(o => o.status === "pending").length, icon: RefreshCw, color: "text-yellow-600" },
    { label: "Catering Requests", value: catering.length, icon: ChefHat, color: "text-purple-600" },
    { label: "Revenue (confirmed)", value: `$${bulkOrders.filter(o => ["confirmed","ready","completed"].includes(o.status)).reduce((s, o) => s + o.total, 0).toFixed(0)}`, icon: DollarSign, color: "text-green-600" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Orders</h1>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-2 rounded-lg transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={15} className={color} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(["bulk","catering"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-[#2C1810] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"}`}>
            {t === "bulk" ? "Bulk Orders" : "Catering Requests"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />)}</div>
      ) : tab === "bulk" ? (
        <div className="space-y-3">
          {bulkOrders.length === 0 && <div className="text-center py-12 text-gray-400">No orders yet</div>}
          {bulkOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{order.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${statusColors[order.status]}`}>{order.status}</span>
                    {order.discountApplied && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">🎉 {order.discountPercent}% off</span>}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">{order.name}</div>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-3 mt-1">
                    <span>{order.email}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} /> Pickup: {order.pickupDate}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {order.items.map((item) => (
                      <span key={item.itemId} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">{item.name} × {item.quantity}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-right">
                    {order.discountApplied && <div className="text-xs text-gray-400 line-through">${order.subtotal.toFixed(2)}</div>}
                    <div className="text-lg font-bold text-[#D4A017]">${order.total.toFixed(2)}</div>
                  </div>
                  <select value={order.status} onChange={async (e) => { await patchBulkStatus(order.id, e.target.value); fetchOrders(); }}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 cursor-pointer">
                    {BULK_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {catering.length === 0 && <div className="text-center py-12 text-gray-400">No catering requests yet</div>}
          {catering.map((req) => (
            <div key={req.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{req.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${statusColors[req.status] ?? "bg-gray-100"}`}>{req.status}</span>
                  </div>
                  <div className="text-sm text-gray-700 font-medium">{req.name}</div>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-3 mt-1">
                    <span>{req.email}</span>
                    <span className="flex items-center gap-1"><Tag size={11} /> {req.eventType}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {req.eventDate}</span>
                    <span className="flex items-center gap-1"><Users size={11} /> {req.guestCount} guests</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 italic">Budget: {req.budget}</p>
                </div>
                <select value={req.status} onChange={async (e) => { await patchCatStatus(req.id, e.target.value); fetchOrders(); }}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 cursor-pointer shrink-0">
                  {CAT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
