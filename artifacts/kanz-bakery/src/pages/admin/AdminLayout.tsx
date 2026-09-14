import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, ShoppingBag, Tag, Package, MessageSquare, LogOut, Menu, X, Croissant, ChevronRight, UsersRound } from "lucide-react";
import { useAuth } from "../../context/useAuth";

const navItems = [
  { path: "/admin/orders",     label: "Orders",          icon: ShoppingBag },
  { path: "/admin/products",   label: "Products",        icon: Package },
  { path: "/admin/categories", label: "Categories",      icon: Tag },
  { path: "/admin/employees",  label: "Employees",       icon: UsersRound },
  { path: "/admin/chat",       label: "Customer Chat",   icon: MessageSquare },
];

interface AdminLayoutProps { children: React.ReactNode; }

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-[#1A0F0A] ${mobile ? "" : "w-64"}`}>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-[#D4A017] rounded-full flex items-center justify-center">
            <Croissant size={17} className="text-[#2C1810]" />
          </div>
          <div>
             <div className="text-white font-bold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>Ovenly bekery</div>
            <div className="text-[#D4A017]/70 text-[10px] tracking-wide uppercase">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="text-[#F5E6C8]/30 text-[10px] uppercase tracking-widest px-3 mb-3">Management</p>
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.startsWith(path);
          return (
            <Link key={path} href={path} data-testid={`link-admin-${path.split("/").pop()}`} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-[#D4A017] text-[#2C1810]" : "text-[#F5E6C8]/60 hover:text-[#F5E6C8] hover:bg-white/8"}`}>
              <Icon size={16} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 bg-[#D4A017]/20 rounded-full flex items-center justify-center text-[#D4A017] text-xs font-bold">
            {user?.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-xs font-medium truncate">{user?.name}</div>
            <div className="text-[#F5E6C8]/40 text-[10px] truncate">{user?.email}</div>
          </div>
        </div>
        <button data-testid="button-admin-sign-out" onClick={handleLogout} className="w-full flex items-center gap-2 text-xs text-[#F5E6C8]/50 hover:text-red-400 transition-colors px-1 py-1.5">
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F5F0E8] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden">
            <Sidebar mobile />
          </div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 shrink-0 gap-3">
          <button data-testid="button-open-admin-menu" onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500 hidden sm:flex">
            <LayoutDashboard size={14} />
            <span>/</span>
            <span className="text-gray-900 font-medium capitalize">
              {navItems.find(n => location.startsWith(n.path))?.label ?? "Dashboard"}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/" className="text-xs text-[#D4A017] hover:underline hidden sm:block">← View Store</Link>
            <div className="w-7 h-7 bg-[#D4A017] rounded-full flex items-center justify-center text-[#2C1810] text-xs font-bold">
              {user?.name[0]}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
