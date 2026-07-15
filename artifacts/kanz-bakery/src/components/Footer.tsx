import { MapPin, Phone, Mail, Clock, Croissant, Instagram, Facebook } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-[#2C1810] text-[#F5E6C8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#D4A017] rounded-full flex items-center justify-center">
                <Croissant size={20} className="text-[#2C1810]" />
              </div>
              <div>
                <div className="font-bold text-xl leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Kanz Bakery
                </div>
                <div className="text-[#D4A017] text-[10px] tracking-widest uppercase leading-none">
                  Est. 2010
                </div>
              </div>
            </div>
            <p className="text-[#F5E6C8]/60 text-sm leading-relaxed">
              Handcrafted with love, baked fresh every day. Bringing warmth and joy to every table since 2010.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-[#D4A017] rounded-lg flex items-center justify-center transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-[#D4A017] rounded-lg flex items-center justify-center transition-colors">
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-[#D4A017] mb-4 tracking-wide text-sm uppercase">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { path: "/", label: "Home" },
                { path: "/menu", label: "Our Menu" },
                { path: "/bulk-order", label: "Bulk Orders" },
                { path: "/catering", label: "Catering" },
              ].map((link) => (
                <li key={link.path}>
                  <Link href={link.path} className="text-[#F5E6C8]/60 hover:text-[#D4A017] text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold text-[#D4A017] mb-4 tracking-wide text-sm uppercase">Hours</h4>
            <ul className="space-y-2.5 text-sm text-[#F5E6C8]/60">
              <li className="flex gap-2 items-start">
                <Clock size={14} className="text-[#D4A017] mt-0.5 shrink-0" />
                <div>
                  <div>Mon – Fri: 6:30am – 8pm</div>
                  <div>Sat: 7am – 9pm</div>
                  <div>Sun: 8am – 5pm</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-[#D4A017] mb-4 tracking-wide text-sm uppercase">Contact</h4>
            <ul className="space-y-3 text-sm text-[#F5E6C8]/60">
              <li className="flex gap-2 items-start">
                <MapPin size={14} className="text-[#D4A017] mt-0.5 shrink-0" />
                <span>24 Golden Lane, Oldtown, NY 10001</span>
              </li>
              <li className="flex gap-2 items-center">
                <Phone size={14} className="text-[#D4A017] shrink-0" />
                <span>+1 (212) 555-0182</span>
              </li>
              <li className="flex gap-2 items-center">
                <Mail size={14} className="text-[#D4A017] shrink-0" />
                <span>hello@kanzbakery.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[#F5E6C8]/40 text-xs">
          <span>© 2024 Kanz Bakery. All rights reserved.</span>
          <span>Made with ♥ and a lot of flour</span>
        </div>
      </div>
    </footer>
  );
}
