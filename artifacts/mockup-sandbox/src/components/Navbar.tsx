import { useState } from "react";
import { ShoppingCart, Menu, X, Croissant } from "lucide-react";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartCount: number;
  onCartOpen: () => void;
}

const navLinks = [
  { id: "home", label: "Home" },
  { id: "menu", label: "Menu" },
  { id: "bulk-order", label: "Bulk Orders" },
  { id: "catering", label: "Catering" },
];

export default function Navbar({
  currentPage,
  onNavigate,
  cartCount,
  onCartOpen,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#2C1810]/95 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNav("home")}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 bg-[#D4A017] rounded-full flex items-center justify-center group-hover:bg-[#E8B82A] transition-colors">
              <Croissant size={18} className="text-[#2C1810]" />
            </div>
            <div className="text-left">
              <div className="font-bold text-[#F5E6C8] text-lg leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                Kanz
              </div>
              <div className="text-[#D4A017] text-[10px] tracking-widest uppercase leading-none">
                Bakery
              </div>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === link.id
                    ? "bg-[#D4A017] text-[#2C1810]"
                    : "text-[#F5E6C8]/80 hover:text-[#F5E6C8] hover:bg-white/10"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Cart + Mobile Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCartOpen}
              className="relative p-2.5 rounded-xl bg-[#D4A017] hover:bg-[#E8B82A] transition-colors group"
            >
              <ShoppingCart size={20} className="text-[#2C1810]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2.5 rounded-xl text-[#F5E6C8]/80 hover:text-[#F5E6C8] hover:bg-white/10 transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#2C1810] border-t border-white/10 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentPage === link.id
                  ? "bg-[#D4A017] text-[#2C1810]"
                  : "text-[#F5E6C8]/80 hover:text-[#F5E6C8] hover:bg-white/10"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
