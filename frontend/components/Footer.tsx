import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-navy-800 bg-navy-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-base">PACTFLOW</span>
          <span className="text-xs text-slate-500 font-mono">| Where Work Meets Trust</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <Link href="/dashboard" className="hover:text-white transition-colors">Client Hub</Link>
          <Link href="/freelancer" className="hover:text-white transition-colors">Freelancer Hub</Link>
          <Link href="/ledger" className="hover:text-white transition-colors">Trust Ledger Explorer</Link>
          <a href="https://developer.paypal.com/docs/api/invoicing/v2/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">PayPal API Docs</a>
        </div>

        <div className="text-xs text-slate-500 text-center md:text-right font-mono">
          <p>Sealed with SHA-256 Ledger & PayPal Sandbox</p>
          <p className="mt-1">Built for the Global AI & Fintech Hackathon 2026</p>
        </div>
      </div>
    </footer>
  );
}
