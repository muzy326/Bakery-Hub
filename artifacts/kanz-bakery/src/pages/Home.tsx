import { ArrowRight, Award, Clock, Heart, Leaf, ChevronDown } from "lucide-react";
import { Link } from "wouter";

const values = [
  { icon: Heart, title: "Made with Love", desc: "Every loaf, pastry, and cake is crafted by hand with genuine care and attention to detail." },
  { icon: Leaf, title: "Fresh Ingredients", desc: "We source locally and seasonally — from our stone-milled flour to our farm-fresh eggs." },
  { icon: Clock, title: "Baked Daily", desc: "Nothing sits on our shelves overnight. We bake fresh every morning before the sun rises." },
  { icon: Award, title: "Award Winning", desc: "Recognized by the New York Artisan Bakers Guild and featured in Bon Appétit Magazine." },
];

const teamMembers = [
  { name: "Leila Kanz", role: "Founder & Head Baker", bio: "With 20 years of pastry experience across Paris and New York, Leila built Kanz on the belief that exceptional bread changes your day.", image: "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400&q=80" },
  { name: "Omar Rashid", role: "Pastry Chef", bio: "Trained at Le Cordon Bleu Paris, Omar brings classical French technique with a creative Middle-Eastern twist.", image: "https://images.unsplash.com/photo-1583394293214-5b2c281ed8dd?w=400&q=80" },
  { name: "Sofia Chen", role: "Cake Designer", bio: "An artist at heart, Sofia transforms cakes into edible sculptures. Her celebration cakes are booked months in advance.", image: "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=400&q=80" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1600&q=80)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2C1810]/75 via-[#2C1810]/60 to-[#2C1810]/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-[#D4A017]/20 border border-[#D4A017]/40 text-[#D4A017] text-sm px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-[#D4A017] rounded-full animate-pulse" />
            Baking fresh since 2010 · New York City
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Where Every Bite<br /><span className="text-[#D4A017]">Tells a Story</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/75 max-w-xl mx-auto mb-10 leading-relaxed">
            Handcrafted breads, pastries, and celebration cakes made fresh daily. Kanz Bakery is your neighborhood sanctuary of taste.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu" className="inline-flex items-center justify-center gap-2 bg-[#D4A017] hover:bg-[#E8B82A] text-[#2C1810] font-bold px-8 py-4 rounded-2xl text-base transition-all duration-200 shadow-lg shadow-[#D4A017]/30 hover:shadow-[#D4A017]/50 hover:-translate-y-0.5">
              Browse Menu <ArrowRight size={18} />
            </Link>
            <Link href="/catering" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 border border-white/20">
              Book Catering
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
          <ChevronDown size={24} />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#2C1810] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[{ value: "14+", label: "Years of Baking" }, { value: "200+", label: "Menu Items" }, { value: "50K+", label: "Happy Customers" }, { value: "5★", label: "Average Rating" }].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl font-bold text-[#D4A017]" style={{ fontFamily: "'Playfair Display', serif" }}>{stat.value}</div>
                <div className="text-[#F5E6C8]/60 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <span className="text-[#D4A017] text-sm font-semibold tracking-widest uppercase">Our Story</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C1810] mt-3 mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              A Labor of Love, Baked into Every Crumb
            </h2>
            <p className="text-[#2C1810]/65 leading-relaxed mb-5 text-base sm:text-lg">
              Kanz Bakery was born in 2010 when Leila Kanz returned from Paris with a suitcase full of recipes and a dream. Starting with a single sourdough recipe and a rented oven, she built something the neighborhood couldn't live without.
            </p>
            <p className="text-[#2C1810]/65 leading-relaxed mb-8 text-base sm:text-lg">
              Today, our team of passionate bakers starts work at 3am so that when you walk through our door, everything is warm, fresh, and made from scratch.
            </p>
            <Link href="/menu" className="inline-flex items-center gap-2 bg-[#2C1810] hover:bg-[#3D2418] text-[#F5E6C8] font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm">
              Explore Our Menu <ArrowRight size={16} />
            </Link>
          </div>
          <div className="order-1 lg:order-2 relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
              <img src="https://images.unsplash.com/photo-1559620192-032c4bc4674e?w=800&q=80" alt="Baker at work" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-[#D4A017] text-[#2C1810] rounded-2xl p-5 shadow-xl hidden sm:block">
              <div className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>3am</div>
              <div className="text-sm font-medium mt-0.5">We start baking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#F5E6C8]/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#D4A017] text-sm font-semibold tracking-widest uppercase">Why Kanz</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2C1810] mt-3" style={{ fontFamily: "'Playfair Display', serif" }}>Our Baking Philosophy</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#FFF8F0] rounded-xl flex items-center justify-center mb-4 border border-[#D4A017]/20">
                  <Icon size={22} className="text-[#D4A017]" />
                </div>
                <h3 className="font-bold text-[#2C1810] mb-2 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h3>
                <p className="text-[#2C1810]/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-[#D4A017] text-sm font-semibold tracking-widest uppercase">The People</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2C1810] mt-3" style={{ fontFamily: "'Playfair Display', serif" }}>Meet Our Bakers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div key={member.name} className="text-center group">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden mx-auto mb-5 ring-4 ring-[#D4A017]/20 group-hover:ring-[#D4A017]/60 transition-all shadow-lg">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="font-bold text-[#2C1810] text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>{member.name}</h3>
              <p className="text-[#D4A017] text-sm font-medium mb-3">{member.role}</p>
              <p className="text-[#2C1810]/60 text-sm leading-relaxed max-w-xs mx-auto">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-4 sm:mx-6 lg:mx-8 mb-20 rounded-3xl overflow-hidden relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=1400&q=80)" }} />
        <div className="absolute inset-0 bg-[#2C1810]/80" />
        <div className="relative py-16 sm:py-20 px-6 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Planning a Special Event?</h2>
          <p className="text-white/70 mb-8 text-base sm:text-lg">From intimate gatherings to grand celebrations, our catering team brings the Kanz experience to your table.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catering" className="bg-[#D4A017] hover:bg-[#E8B82A] text-[#2C1810] font-bold px-8 py-3.5 rounded-xl transition-colors">Book Catering</Link>
            <Link href="/bulk-order" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors border border-white/20">Bulk Orders</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
