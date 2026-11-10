'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Layers, Mail, Phone, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="glass-card p-8 sm:p-12 rounded-3xl border border-[#E8DFD3] shadow-sm text-center space-y-6 max-w-lg w-full relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-900 shadow-sm">
          <ShieldAlert className="w-8 h-8 text-stone-800" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-300 text-stone-800 text-[11px] font-mono font-medium tracking-wider uppercase">
            Error 404 • Resource Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#231A12] tracking-tight">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-[#6B5C4D] leading-relaxed max-w-md mx-auto font-normal">
            The cryptographic project workspace, milestone, or page you requested does not exist or may have been relocated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 min-h-[42px]"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-[#231A12] border border-[#DFD4C3] text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 min-h-[42px]"
          >
            <Layers className="w-4 h-4 text-stone-700" />
            <span>Client Dashboard</span>
          </Link>
        </div>

        <div className="pt-6 border-t border-[#EAE1D2] space-y-2 text-xs text-[#7A6C5B]">
          <span className="font-semibold block text-[#4B3F33]">Need immediate assistance?</span>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <a
              href="mailto:support@pactflow.io"
              className="text-stone-900 hover:text-amber-800 transition-colors inline-flex items-center gap-1.5 underline"
            >
              <Mail className="w-3.5 h-3.5 text-stone-700" /> support@pactflow.io
            </a>
            <span className="text-[#C5B7A6]">•</span>
            <a
              href="tel:+18005557228"
              className="text-amber-800 hover:text-amber-950 transition-colors inline-flex items-center gap-1.5 underline"
            >
              <Phone className="w-3.5 h-3.5 text-amber-700" /> +1 (800) 555-7228
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
