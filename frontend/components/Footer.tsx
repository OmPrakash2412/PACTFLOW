import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#E8DFD3] bg-[#FAF7F2]/80 backdrop-blur-xl text-[#6B5C4D] py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-[#231A12] text-base tracking-tight">PACTFLOW</span>
          <span className="text-xs text-[#8C7D6C] font-mono">| Where Work Meets Trust</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
          <Link href="/dashboard" className="hover:text-[#1F1914] transition-colors">Client Hub</Link>
          <Link href="/freelancer" className="hover:text-[#1F1914] transition-colors">Freelancer Hub</Link>
          <Link href="/ledger" className="hover:text-[#1F1914] transition-colors">Trust Ledger Explorer</Link>
          <a href="https://developer.paypal.com/docs/api/invoicing/v2/" target="_blank" rel="noreferrer" className="hover:text-[#1F1914] transition-colors">PayPal API Docs</a>
        </div>

        <div className="text-xs text-[#8C7D6C] text-center md:text-right font-mono">
          <p>Cryptographic SHA-256 Ledger & PayPal Sandbox</p>
          <p className="mt-1">Where Work Meets Trust</p>
        </div>
      </div>
    </footer>
  );
}
