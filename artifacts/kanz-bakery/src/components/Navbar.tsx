import { useState } from "react";
import { ShoppingCart, Menu, X, Croissant, User, LogOut, Package, ShieldCheck, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/useAuth";

interface NavbarProps {
  cartCount: number;
  onCartOpen: () => void;
}

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/menu", label: "Menu" },
  { path: "/bulk-order", label: "Bulk Orders" },
  { path: "/catering", label: "Catering" },
];

export default function Navbar({ cartCount, onCartOpen }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#2C1810]/95 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-[#D4A017] rounded-full flex items-center justify-center group-hover:bg-[#E8B82A] transition-colors">
              <Croissant size={18} className="text-[#2C1810]" />
            </div>
            <div className="text-left">
              <div className="font-bold text-[#F5E6C8] text-lg leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                Ovenly
              </div>
              <div className="text-[#D4A017] text-[10px] tracking-widest uppercase leading-none">
                bekery
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? "bg-[#D4A017] text-[#2C1810]"
                    : "text-[#F5E6C8]/80 hover:text-[#F5E6C8] hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={onCartOpen}
              className="relative p-2.5 rounded-xl bg-[#D4A017] hover:bg-[#E8B82A] transition-colors"
            >
              <ShoppingCart size={20} className="text-[#2C1810]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Account — desktop */}
            <div className="hidden md:block relative">
              {user ? (
                <>
                  <button
                    onClick={() => setAccountOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="w-7 h-7 bg-[#D4A017]/30 border border-[#D4A017]/50 rounded-full flex items-center justify-center text-[#D4A017] text-xs font-bold">
                      {user.name[0]}
                    </div>
                    <span className="text-[#F5E6C8]/80 text-xs font-medium max-w-20 truncate">{user.name}</span>
                    <ChevronDown size={12} className={`text-[#F5E6C8]/50 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
                  </button>

                  {accountOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#F5E6C8] overflow-hidden z-20">
                        <div className="px-4 py-3 border-b border-[#F5E6C8] bg-[#FFF8F0]">
                          <p className="text-xs font-semibold text-[#2C1810] truncate">{user.name}</p>
                          <p className="text-[10px] text-[#2C1810]/50 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link href="/my-orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#2C1810] hover:bg-[#FFF8F0] transition-colors">
                            <Package size={14} className="text-[#D4A017]" /> My Orders
                          </Link>
                          {user.role === "admin" && (
                            <Link href="/admin/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#2C1810] hover:bg-[#FFF8F0] transition-colors">
                              <ShieldCheck size={14} className="text-purple-500" /> Admin Panel
                            </Link>
                          )}
                          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <LogOut size={14} /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link href="/login" className="text-[#F5E6C8]/80 hover:text-[#F5E6C8] text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register" className="bg-[#D4A017] hover:bg-[#E8B82A] text-[#2C1810] text-sm font-semibold px-3 py-2 rounded-lg transition-colors">
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
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
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(link.path)
                  ? "bg-[#D4A017] text-[#2C1810]"
                  : "text-[#F5E6C8]/80 hover:text-[#F5E6C8] hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/10 mt-2 pt-2 space-y-1">
            {user ? (
              <>
                <div className="flex items-center gap-2.5 px-4 py-2">
                  <div className="w-7 h-7 bg-[#D4A017]/30 border border-[#D4A017]/50 rounded-full flex items-center justify-center text-[#D4A017] text-xs font-bold">{user.name[0]}</div>
                  <div><p className="text-[#F5E6C8] text-xs font-medium">{user.name}</p><p className="text-[#F5E6C8]/40 text-[10px]">{user.email}</p></div>
                </div>
                <Link href="/my-orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-[#F5E6C8]/80 hover:text-[#F5E6C8] hover:bg-white/10 transition-colors">
                  <Package size={15} className="text-[#D4A017]" /> My Orders
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-[#F5E6C8]/80 hover:text-[#F5E6C8] hover:bg-white/10 transition-colors">
                    <ShieldCheck size={15} className="text-purple-400" /> Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-[#F5E6C8]/80 hover:bg-white/10 transition-colors">
                  <User size={14} className="inline mr-2" /> Sign In
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold bg-[#D4A017] text-[#2C1810] hover:bg-[#E8B82A] transition-colors text-center">
                  Register — Get 50% Off
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
