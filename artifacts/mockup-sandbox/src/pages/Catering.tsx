import { useState } from "react";
import { CheckCircle2, ArrowRight, Users, Calendar, Utensils, Sparkles } from "lucide-react";
import { submitCateringRequest } from "../lib/api";

interface FormData {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: string;
  requirements: string;
  budget: string;
}

const eventTypes = [
  "Corporate Event",
  "Wedding",
  "Birthday Party",
  "Baby Shower",
  "Graduation",
  "Holiday Party",
  "Anniversary",
  "Other",
];

const budgetRanges = [
  "Under $500",
  "$500 – $1,000",
  "$1,000 – $2,500",
  "$2,500 – $5,000",
  "$5,000+",
  "Let's discuss",
];

const packages = [
  {
    icon: Utensils,
    name: "The Breakfast Spread",
    desc: "Freshly baked breads, pastries, mini quiches, fruit tarts, and assorted morning treats.",
    serves: "20–50 guests",
    from: "$8/person",
  },
  {
    icon: Sparkles,
    name: "The Celebration Table",
    desc: "Custom celebration cake, cupcakes, cake pops, petit fours, and dessert platters.",
    serves: "30–100 guests",
    from: "$12/person",
  },
  {
    icon: Users,
    name: "The Full Experience",
    desc: "Complete catering with bread baskets, pastry platters, dessert stations, and a custom centerpiece cake.",
    serves: "50–200 guests",
    from: "$20/person",
  },
];

export default function Catering() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    guestCount: "",
    requirements: "",
    budget: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateStr = minDate.toISOString().split("T")[0];

  const update = (key: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitCateringRequest({
        ...form,
        guestCount: parseInt(form.guestCount, 10),
      });
      setSuccess(res.message);
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
          <h2 className="text-2xl font-bold text-[#2C1810] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Request Received!
          </h2>
          <p className="text-[#2C1810]/65 leading-relaxed mb-8">{success}</p>
          <button
            onClick={() => setSuccess(null)}
            className="bg-[#2C1810] text-[#F5E6C8] font-semibold px-8 py-3.5 rounded-xl hover:bg-[#3D2418] transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Hero */}
      <div className="relative bg-[#2C1810] pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=1400&q=80)" }}
        />
        <div className="relative">
          <span className="text-[#D4A017] text-sm font-semibold tracking-widest uppercase">
            Events & Celebrations
          </span>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Catering by Kanz
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-sm sm:text-base">
            From boardroom breakfasts to garden weddings — we bring our bakery to
            your event with the same love and craft in every bite.
          </p>
        </div>
      </div>

      {/* Packages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2C1810]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Catering Packages
          </h2>
          <p className="text-[#2C1810]/55 text-sm mt-2">All packages are customizable to your event needs.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {packages.map(({ icon: Icon, name, desc, serves, from }) => (
            <div key={name} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-[#D4A017]/10">
              <div className="w-12 h-12 bg-[#FFF8F0] rounded-xl flex items-center justify-center mb-4">
                <Icon size={22} className="text-[#D4A017]" />
              </div>
              <h3 className="font-bold text-[#2C1810] text-lg mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                {name}
              </h3>
              <p className="text-[#2C1810]/60 text-sm mb-4 leading-relaxed">{desc}</p>
              <div className="flex items-center justify-between text-sm pt-4 border-t border-[#F5E6C8]">
                <span className="text-[#2C1810]/50">
                  <Users size={13} className="inline mr-1" />{serves}
                </span>
                <span className="text-[#D4A017] font-bold">from {from}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#2C1810]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Request a Quote
              </h2>
              <p className="text-sm text-[#2C1810]/50 mt-1">
                Tell us about your event and we'll craft a custom proposal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#2C1810] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Jane Smith"
                    className="w-full px-4 py-3 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm placeholder:text-[#2C1810]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C1810] mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={update("email")}
                    placeholder="jane@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm placeholder:text-[#2C1810]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C1810] mb-1.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm placeholder:text-[#2C1810]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C1810] mb-1.5">
                    Event Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={form.eventType}
                    onChange={update("eventType")}
                    className="w-full px-4 py-3 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm bg-white"
                  >
                    <option value="">Select event type…</option>
                    {eventTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C1810] mb-1.5">
                    <Calendar size={13} className="inline mr-1" />
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={minDateStr}
                    value={form.eventDate}
                    onChange={update("eventDate")}
                    className="w-full px-4 py-3 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C1810] mb-1.5">
                    <Users size={13} className="inline mr-1" />
                    Guest Count <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={form.guestCount}
                    onChange={update("guestCount")}
                    placeholder="e.g. 50"
                    className="w-full px-4 py-3 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm placeholder:text-[#2C1810]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C1810] mb-1.5">
                  Budget Range <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {budgetRanges.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setForm({ ...form, budget: b })}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                        form.budget === b
                          ? "bg-[#2C1810] text-[#F5E6C8] border-[#2C1810]"
                          : "bg-white text-[#2C1810] border-[#D4A017]/20 hover:border-[#D4A017]/60"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                {!form.budget && (
                  <input type="hidden" required value={form.budget} />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C1810] mb-1.5">
                  Menu Requirements & Special Requests <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.requirements}
                  onChange={update("requirements")}
                  placeholder="Tell us about your vision, dietary needs (vegan, gluten-free, nut allergies), theme, style preferences, or any special requests…"
                  className="w-full px-4 py-3 rounded-xl border border-[#D4A017]/20 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm placeholder:text-[#2C1810]/30 resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <div className="bg-[#FFF8F0] rounded-xl p-4 text-xs text-[#2C1810]/50 leading-relaxed border border-[#D4A017]/10">
                🎂 We recommend booking at least 2 weeks in advance. For weddings and large events, 4–8 weeks is ideal.
              </div>

              <button
                type="submit"
                disabled={submitting || !form.budget}
                className="w-full flex items-center justify-center gap-2 bg-[#D4A017] hover:bg-[#E8B82A] disabled:opacity-50 disabled:cursor-not-allowed text-[#2C1810] font-bold py-4 rounded-xl transition-colors text-sm"
              >
                {submitting ? "Sending Request…" : (
                  <>
                    Send Catering Request <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
