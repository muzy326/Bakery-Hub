import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Croissant, Eye, EyeOff, UserPlus, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError(null);
    try {
      await register(form.name, form.email, form.password);
      navigate("/menu");
    } catch (err: any) {
      setError(err.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    "50% off your very first order",
    "Track your bulk orders & catering",
    "Chat support with our team",
    "Early access to new products",
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#2C1810] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Croissant size={28} className="text-[#D4A017]" />
          </div>
          <h1 className="text-3xl font-bold text-[#2C1810]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Create Your Account
          </h1>
          <p className="text-[#2C1810]/55 mt-2 text-sm">Join thousands of happy Kanz customers</p>
        </div>

        {/* Perks banner */}
        <div className="bg-[#D4A017]/10 border border-[#D4A017]/25 rounded-2xl px-5 py-4 mb-6">
          <p className="text-sm font-semibold text-[#8B5E3C] mb-3">🎁 Member benefits</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {perks.map((p) => (
              <div key={p} className="flex items-center gap-2 text-sm text-[#8B5E3C]">
                <CheckCircle2 size={14} className="text-[#D4A017] shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#F5E6C8]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#2C1810] mb-1.5">Full Name</label>
                <input type="text" required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm placeholder:text-[#2C1810]/30" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#2C1810] mb-1.5">Email Address</label>
                <input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm placeholder:text-[#2C1810]/30" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C1810] mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} required autoComplete="new-password" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm placeholder:text-[#2C1810]/30" />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2C1810]/40">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C1810] mb-1.5">Confirm Password</label>
                <input type="password" required autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat password"
                  className="w-full px-4 py-3 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm placeholder:text-[#2C1810]/30" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#D4A017] hover:bg-[#E8B82A] disabled:opacity-60 text-[#2C1810] font-bold py-3.5 rounded-xl transition-colors text-sm">
              <UserPlus size={16} />
              {loading ? "Creating account…" : "Create Account & Get 50% Off"}
            </button>
          </form>

          <p className="text-center text-sm text-[#2C1810]/50 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#D4A017] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
