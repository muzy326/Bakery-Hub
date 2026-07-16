import { useState, useEffect } from "react";
import { Link } from "wouter";
import { PackageOpen, Calendar, Tag, ChefHat, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface BulkOrder {
  id: string;
  items: { itemId: string; name: string; quantity: number }[];
  pickupDate: string;
  notes: string;
  createdAt: string;
  status: string;
  discountApplied: boolean;
  discountPercent: number;
  subtotal: number;
  total: number;
}
interface CateringReq {
  id: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  budget: string;
  requirements: string;
  createdAt: string;
  status: string;
}

const statusColors: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  ready:     "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"bulk" | "catering">("bulk");
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([]);
  const [catering, setCatering] = useState<CateringReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/my", { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json() as { bulkOrders: BulkOrder[]; cateringRequests: CateringReq[] };
      setBulkOrders(data.bulkOrders.reverse());
      setCatering(data.cateringRequests.reverse());
    } catch {
      setError("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  // Only fetch once we know the user is authenticated.
  // Without this guard, the effect fires before auth resolves and
  // generates a 401 on /api/orders/my for every page load.
  useEffect(() => {
    if (authLoading) return;   // wait for auth to resolve
    if (!user) { setLoading(false); return; } // not logged in — skip the fetch
    fetchOrders();
  }, [user, authLoading]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4 pt-16">
        <div className="text-center max-w-sm">
          <PackageOpen size={48} className="text-[#D4A017]/40 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#2C1810] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Sign in to view orders</h2>
          <p className="text-[#2C1810]/55 text-sm mb-6">Track your bulk orders and catering requests.</p>
          <Link href="/login" className="bg-[#D4A017] hover:bg-[#E8B82A] text-[#2C1810] font-bold px-8 py-3 rounded-xl transition-colors text-sm inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <div className="bg-[#2C1810] pt-24 pb-10 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>My Orders</h1>
        <p className="text-white/55 mt-2 text-sm">Hello, {user.name} 👋</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {([["bulk", "Bulk Orders", PackageOpen], ["catering", "Catering Requests", ChefHat]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === id ? "bg-[#2C1810] text-[#F5E6C8]" : "bg-white text-[#2C1810] border border-[#D4A017]/20 hover:border-[#D4A017]/50"}`}>
              <Icon size={15} />{label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === id ? "bg-white/20 text-white" : "bg-[#D4A017]/15 text-[#8B5E3C]"}`}>
                {id === "bulk" ? bulkOrders.length : catering.length}
              </span>
            </button>
          ))}
          <button onClick={fetchOrders} className="ml-auto p-2.5 rounded-xl bg-white border border-[#D4A017]/20 text-[#2C1810]/50 hover:text-[#2C1810] transition-colors">
            <RefreshCw size={15} />
          </button>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />)}
          </div>
        )}

        {error && <div className="text-center py-16 text-red-500">{error}</div>}

        {!loading && !error && tab === "bulk" && (
          bulkOrders.length === 0 ? (
            <div className="text-center py-16">
              <PackageOpen size={40} className="text-[#D4A017]/30 mx-auto mb-3" />
              <p className="text-[#2C1810]/50 font-medium">No bulk orders yet</p>
              <Link href="/menu" className="text-[#D4A017] text-sm hover:underline mt-2 block">Browse the menu →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bulkOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#F5E6C8]">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[#2C1810] text-sm">{order.id}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${statusColors[order.status] ?? "bg-gray-100"}`}>{order.status}</span>
                        {order.discountApplied && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-green-100 text-green-700">🎉 {order.discountPercent}% off applied</span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-1.5 text-xs text-[#2C1810]/50">
                        <span className="flex items-center gap-1"><Calendar size={11} /> Pickup: {order.pickupDate}</span>
                        <span className="flex items-center gap-1"><Tag size={11} /> Ordered: {new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {order.discountApplied && (
                        <div className="text-xs text-[#2C1810]/40 line-through">${order.subtotal.toFixed(2)}</div>
                      )}
                      <div className="text-lg font-bold text-[#D4A017]">${order.total.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item) => (
                      <span key={item.itemId} className="text-xs bg-[#FFF8F0] px-3 py-1 rounded-full text-[#8B5E3C] border border-[#D4A017]/15">
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                  {order.notes && <p className="text-xs text-[#2C1810]/40 mt-2 italic">"{order.notes}"</p>}
                </div>
              ))}
            </div>
          )
        )}

        {!loading && !error && tab === "catering" && (
          catering.length === 0 ? (
            <div className="text-center py-16">
              <ChefHat size={40} className="text-[#D4A017]/30 mx-auto mb-3" />
              <p className="text-[#2C1810]/50 font-medium">No catering requests yet</p>
              <Link href="/catering" className="text-[#D4A017] text-sm hover:underline mt-2 block">Request catering →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {catering.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#F5E6C8]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[#2C1810] text-sm">{req.id}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${statusColors[req.status] ?? "bg-gray-100"}`}>{req.status}</span>
                      </div>
                      <p className="text-sm text-[#2C1810]/70 mt-1">{req.eventType} · {req.guestCount} guests · {req.eventDate}</p>
                      <p className="text-xs text-[#2C1810]/45 mt-0.5">Budget: {req.budget}</p>
                    </div>
                    <span className="text-xs text-[#2C1810]/40">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  {req.requirements && <p className="text-xs text-[#2C1810]/50 mt-3 bg-[#FFF8F0] rounded-lg px-3 py-2 italic">"{req.requirements}"</p>}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
