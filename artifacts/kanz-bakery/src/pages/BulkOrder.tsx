import { useState } from "react";
import { PackageOpen, Plus, Minus, Trash2, CheckCircle2, ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import type { CartItem } from "../types";

interface BulkOrderProps {
  cart: CartItem[];
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClearCart: () => void;
}

interface FormData {
  name: string; email: string; phone: string; pickupDate: string; notes: string;
}

export default function BulkOrder({ cart, onUpdateQty, onRemove, onClearCart }: BulkOrderProps) {
  const [form, setForm] = useState<FormData>({ name: "", email: "", phone: "", pickupDate: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) { setError("Please add items to your cart first."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items: cart.map((i) => ({ itemId: i.id, name: i.name, quantity: i.quantity })) }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as { message: string };
      setSuccess(data.message);
      onClearCart();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4 pt-16">
        <div className="max-w-md w-full text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Order Received!</h2>
          <p className="text-[#2C1810]/65 leading-relaxed mb-8">{success}</p>
          <button onClick={() => setSuccess(null)} className="bg-[#2C1810] text-[#F5E6C8] font-semibold px-8 py-3.5 rounded-xl hover:bg-[#3D2418] transition-colors">Place Another Order</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <div className="bg-[#2C1810] pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-[#D4A017] text-sm font-semibold tracking-widest uppercase">Orders</span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Bulk Order</h1>
        <p className="text-white/60 max-w-lg mx-auto text-sm sm:text-base">Ordering for a team, office, or event? Schedule your pickup and we'll have everything ready fresh on the day.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Cart Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-20">
              <div className="px-5 py-4 border-b border-[#F5E6C8] flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-[#2C1810]" style={{ fontFamily: "'Playfair Display', serif" }}>Order Summary</h2>
                  <p className="text-xs text-[#2C1810]/50 mt-0.5">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
                </div>
                <PackageOpen size={20} className="text-[#D4A017]" />
              </div>
              {cart.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-[#2C1810]/40 text-sm">Your cart is empty.</p>
                  <Link href="/menu" className="text-[#D4A017] text-xs hover:underline mt-1 block">Browse the menu →</Link>
                </div>
              ) : (
                <>
                  <div className="px-5 py-4 space-y-3 max-h-72 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#2C1810] truncate">{item.name}</p>
                          <p className="text-xs text-[#D4A017] font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => onUpdateQty(item.id, item.quantity - 1)} className="w-6 h-6 rounded-md bg-[#FFF8F0] flex items-center justify-center hover:bg-[#D4A017] hover:text-white transition-colors border border-[#D4A017]/20"><Minus size={11} /></button>
                          <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
                          <button onClick={() => onUpdateQty(item.id, item.quantity + 1)} className="w-6 h-6 rounded-md bg-[#FFF8F0] flex items-center justify-center hover:bg-[#D4A017] hover:text-white transition-colors border border-[#D4A017]/20"><Plus size={11} /></button>
                          <button onClick={() => onRemove(item.id)} className="w-6 h-6 ml-0.5 flex items-center justify-center text-[#2C1810]/30 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-4 border-t border-[#F5E6C8] bg-[#FFF8F0]">
                    <div className="flex justify-between text-sm font-semibold text-[#2C1810]">
                      <span>Estimated Total</span>
                      <span className="text-[#D4A017] text-base">${total.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-[#2C1810]/40 mt-1">Final price confirmed on pickup. Bulk discounts may apply.</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-[#2C1810] text-xl mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Your Details</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { key: "name", label: "Full Name", type: "text", placeholder: "Jane Smith" },
                    { key: "email", label: "Email Address", type: "email", placeholder: "jane@example.com" },
                    { key: "phone", label: "Phone Number", type: "tel", placeholder: "+1 (555) 000-0000" },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-[#2C1810] mb-1.5">{label} <span className="text-red-500">*</span></label>
                      <input type={type} required value={(form as Record<string, string>)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                        className="w-full px-4 py-3 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm placeholder:text-[#2C1810]/30" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-[#2C1810] mb-1.5"><CalendarDays size={13} className="inline mr-1" />Pickup Date <span className="text-red-500">*</span></label>
                    <input type="date" required min={minDateStr} value={form.pickupDate} onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C1810] mb-1.5">Special Instructions</label>
                  <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Dietary restrictions, packaging preferences…"
                    className="w-full px-4 py-3 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm placeholder:text-[#2C1810]/30 resize-none" />
                </div>
                {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>}
                <div className="bg-[#FFF8F0] rounded-xl p-4 text-xs text-[#2C1810]/50 leading-relaxed border border-[#D4A017]/10">
                  📌 Bulk orders require a minimum of 24 hours notice. We'll call you to confirm and arrange payment. Minimum order: 6 units per item.
                </div>
                <button type="submit" disabled={submitting || cart.length === 0} className="w-full flex items-center justify-center gap-2 bg-[#D4A017] hover:bg-[#E8B82A] disabled:opacity-50 disabled:cursor-not-allowed text-[#2C1810] font-bold py-4 rounded-xl transition-colors text-sm">
                  {submitting ? "Placing Order…" : <> Place Bulk Order <ArrowRight size={16} /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
