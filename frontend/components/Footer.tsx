import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Phone, ExternalLink, Sparkles, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#E8DFD3] bg-[#FAF7F2]/90 backdrop-blur-xl text-[#6B5C4D] py-12 px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center shadow-sm text-white">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-[#231A12] text-lg tracking-tight">PACTFLOW</span>
            </div>
            <p className="text-xs text-[#7A6C5B] leading-relaxed">
              AI-powered agreement synthesis, objective deliverable verification, and PayPal Developer Sandbox milestone settlement coordination.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-[10.5px] font-mono font-semibold">
              <Sparkles className="w-3 h-3 text-amber-700" />
              Where Work Meets Trust
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#231A12] uppercase tracking-wider">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/dashboard" className="hover:text-purple-700 transition-colors">
                  Client Hub & Agreements
                </Link>
              </li>
              <li>
                <Link href="/freelancer" className="hover:text-purple-700 transition-colors">
                  Freelancer Hub & Evidence
                </Link>
              </li>
              <li>
                <Link href="/ledger" className="hover:text-purple-700 transition-colors">
                  SHA-256 Trust Ledger
                </Link>
              </li>
              <li>
                <Link href="/projects/new" className="hover:text-purple-700 transition-colors">
                  Synthesize Project with Gemini
                </Link>
              </li>
              <li>
                <Link href="/empty" className="hover:text-purple-700 transition-colors">
                  Empty State Showcase
                </Link>
              </li>
            </ul>
          </div>

          {/* Official PayPal Sandbox Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#231A12] uppercase tracking-wider">
              Settlement Gateway
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a
                  href="https://developer.paypal.com/docs/api/invoicing/v2/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#231A12] transition-colors inline-flex items-center gap-1"
                >
                  <span>PayPal Invoicing v2 API</span>
                  <ExternalLink className="w-3 h-3 text-[#9A8C7B]" />
                </a>
              </li>
              <li>
                <a
                  href="https://developer.paypal.com/api/rest/webhooks/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#231A12] transition-colors inline-flex items-center gap-1"
                >
                  <span>PayPal Webhooks Guide</span>
                  <ExternalLink className="w-3 h-3 text-[#9A8C7B]" />
                </a>
              </li>
              <li>
                <span className="text-[#8C7D6C] text-[11px] block pt-1">
                  • Mode: Developer Sandbox<br />
                  • Gateway: api-m.sandbox.paypal.com
                </span>
              </li>
            </ul>
          </div>

          {/* Direct Clickable Contact & Support (Email & Phone) */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#231A12] uppercase tracking-wider">
              Support & Inquiries
            </h4>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] text-[#8C7D6C] block uppercase font-mono">Email Support</span>
                <a
                  href="mailto:support@pactflow.io"
                  className="font-bold text-purple-700 hover:text-purple-900 transition-colors inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-purple-700" />
                  <span>support@pactflow.io</span>
                </a>
              </div>

              <div>
                <span className="text-[10px] text-[#8C7D6C] block uppercase font-mono">Toll-Free Phone</span>
                <a
                  href="tel:+18005557228"
                  className="font-bold text-amber-800 hover:text-amber-950 transition-colors inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-700" />
                  <span>+1 (800) 555-PACT (7228)</span>
                </a>
              </div>

              <div className="pt-1 text-[11px] text-[#8C7D6C]">
                Mon–Fri • 9:00 AM – 6:00 PM EST
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Regulatory Bar */}
        <div className="pt-8 border-t border-[#EAE1D2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8C7D6C]">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span>Zero-Escrow Peer-to-Peer Protocol • Built for Global AI Hackathon 2026</span>
          </div>

          <div className="text-center sm:text-right">
            <span>© 2026 PACTFLOW. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
