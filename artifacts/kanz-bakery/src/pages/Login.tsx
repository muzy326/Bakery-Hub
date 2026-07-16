import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Croissant, Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#2C1810] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Croissant size={28} className="text-[#D4A017]" />
          </div>
          <h1 className="text-3xl font-bold text-[#2C1810]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Welcome Back
          </h1>
          <p className="text-[#2C1810]/55 mt-2 text-sm">Sign in to your Kanz Bakery account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#F5E6C8]">
          {/* First-time discount banner */}
          <div className="bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-xl px-4 py-3 mb-6 text-center">
            <p className="text-sm text-[#8B5E3C] font-medium">🎉 New customer? Register and get <strong>50% off your first order!</strong></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#2C1810] mb-1.5">Email Address</label>
              <input
                type="email" required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm placeholder:text-[#2C1810]/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C1810] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm placeholder:text-[#2C1810]/30"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2C1810]/40 hover:text-[#2C1810]">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#2C1810] hover:bg-[#3D2418] disabled:opacity-60 text-[#F5E6C8] font-semibold py-3.5 rounded-xl transition-colors text-sm">
              <LogIn size={16} />
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#2C1810]/50 mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#D4A017] font-semibold hover:underline">Create one</Link>
          </p>

          <div className="mt-5 pt-5 border-t border-[#F5E6C8]">
            <p className="text-center text-xs text-[#2C1810]/40 mb-3">Demo admin access</p>
            <button type="button" onClick={() => setForm({ email: "admin@kanzbakery.com", password: "Admin123!" })}
              className="w-full text-xs py-2 rounded-lg border border-[#D4A017]/30 text-[#8B5E3C] hover:bg-[#FFF8F0] transition-colors">
              Fill admin credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
