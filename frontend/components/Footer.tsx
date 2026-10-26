import React from "react";
import Link from "next/link";
import { GraduationCap, ShieldCheck, Video, Clock, ArrowUpRight, MapPin, Phone, Mail, Sparkles, Sprout, Factory } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[#091c14] text-white border-t border-[#163a2b]">
      {/* Decorative accent line */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#F5C400] to-transparent opacity-80" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Col 1 & 2: Brand & Founder Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Ignited Dreams Logo"
                className="w-11 h-11 rounded-full object-cover shadow-[0_0_15px_rgba(245,196,0,0.35)] border border-[#F5C400]/50 shrink-0"
              />
              <div>
                <span className="font-black text-xl tracking-tight text-white font-heading">
                  IGNITED DREAMS <span className="text-[#F5C400]">INTEGRATED</span>
                </span>
                <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">
                  The Pathfinder for Educated Youth
                </p>
              </div>
            </Link>

            <p className="text-xs text-slate-200 max-w-sm leading-relaxed font-normal">
              An integrated ecosystem combining a For-Profit Career Skill Academy (Transportation, Logistics with SAP, Aviation Operations) with Non-Profit Micro-FMCG Production Co-operatives and Village Agriculture Societies.
            </p>

            <div className="pt-2 text-xs text-slate-200 space-y-1.5 border-t border-white/10 font-medium">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#F5C400] shrink-0" />
                <span>Coordinator: Justin Burnard Dias (+91 7012002405)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#F5C400] shrink-0" />
                <span>burnarddiasjustin@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Col 3: Programs & Fees */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F5C400] font-heading">
              Skill Programs
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-200">
              <li>
                <Link href="/courses/transportation-logistics-sap" className="hover:text-white transition-colors">
                  Logistics &amp; Transport with SAP
                </Link>
              </li>
              <li>
                <Link href="/courses/aviation-management-airport-operations" className="hover:text-white transition-colors">
                  Aviation Ground Operations
                </Link>
              </li>
              <li>
                <Link href="/courses/supply-chain-freight-forwarding" className="hover:text-white transition-colors">
                  Global Supply Chain &amp; Freight
                </Link>
              </li>
              <li>
                <Link href="/courses/air-cargo-logistics-dgr" className="hover:text-white transition-colors">
                  Air Cargo &amp; DGR Regulations
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="text-[#F5C400] font-bold hover:underline flex items-center gap-1">
                  Pay Fee &amp; Check In Online <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Classroom */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F5C400] font-heading">
              Platform &amp; Monitoring
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-200">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Student Portal Login
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="text-[#F5C400] font-bold hover:underline">
                  Enroll &amp; Pay Fee Online
                </Link>
              </li>
              <li>
                <Link href="/student/dashboard" className="hover:text-white transition-colors">
                  Enrolled Cadet Portal
                </Link>
              </li>
              <li className="space-y-1 pt-1">
                <span className="text-[11px] text-slate-300 block font-medium">
                  • 1 Mentor + 2 Trainers / 50 Students
                </span>
                <span className="text-[11px] text-slate-300 block font-medium">
                  • 3 Hours Daily (2h Class + 1h Doubts)
                </span>
                <span className="text-[11px] text-slate-300 block font-medium">
                  • 2-Year Vault Server Retention
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Integrated Co-operative Wings */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F5C400] font-heading">
              Integrated Wings (Non-Profit)
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-start gap-1.5">
                <Factory className="w-3.5 h-3.5 text-[#F5C400] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Micro-FMCG Units:</strong> Toffee, chocolates &amp; packaged foods with 10%–20% operational fee.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-[#F5C400] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Village Agriculture:</strong> Inverted gardens, anti-middleman farmer collectives &amp; direct cocoa linkage.
                </span>
              </li>
              <li className="pt-2 text-[11px] font-mono text-[#F5C400] font-bold">
                Phase 1 Launch: 20th October 2026
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 mt-12 border-t border-white/10 text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Ignited Dreams Integrated (ID Integrated). All rights reserved. • Powered by <a href="https://clixdot.com/" target="_blank" rel="noopener noreferrer" className="text-[#F5C400] hover:underline font-semibold">Clixdot</a></p>
          <div className="flex items-center gap-6 text-slate-300">
            <span>Website: www.igniteddreams.com</span>
            <span>Coordinator: Justin Burnard Dias</span>
            <span>Ernakulam, Kerala</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
