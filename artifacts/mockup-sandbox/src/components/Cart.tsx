import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import type { CartItem } from "../types";

interface CartProps {
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export default function Cart({ items, onClose, onUpdateQty, onRemove, onCheckout }: CartProps) {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5E6C8]">
          <div>
            <h2 className="font-bold text-[#2C1810] text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              Your Cart
            </h2>
            <p className="text-sm text-[#2C1810]/50">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#F5E6C8] transition-colors"
          >
            <X size={20} className="text-[#2C1810]" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <ShoppingBag size={48} className="text-[#D4A017]/40" />
              <div>
                <p className="text-[#2C1810]/60 font-medium">Your cart is empty</p>
                <p className="text-sm text-[#2C1810]/40 mt-1">Add some delicious items from the menu!</p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 bg-[#FFF8F0] rounded-xl p-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-semibold text-[#2C1810] text-sm leading-snug truncate pr-1">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-[#2C1810]/30 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-[#D4A017] font-bold text-sm mt-1">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-[#D4A017]/30 flex items-center justify-center hover:bg-[#D4A017] hover:text-white transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-semibold text-[#2C1810] w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-[#D4A017]/30 flex items-center justify-center hover:bg-[#D4A017] hover:text-white transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-[#F5E6C8]">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-[#2C1810]/70">Total</span>
              <span className="font-bold text-xl text-[#2C1810]">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-[#D4A017] hover:bg-[#E8B82A] text-[#2C1810] font-bold py-3.5 rounded-xl transition-colors text-sm"
            >
              Proceed to Bulk Order
            </button>
            <p className="text-center text-xs text-[#2C1810]/40 mt-3">
              Or visit our catering page for events
            </p>
          </div>
        )}
      </div>
    </>
  );
}
