'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Layers, Mail, Phone, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="glass-card p-8 sm:p-12 rounded-3xl border border-white/90 shadow-glass text-center space-y-6 max-w-lg w-full relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-300/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />

        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-100 via-amber-100 to-rose-100 border border-purple-200 flex items-center justify-center mx-auto text-purple-700 shadow-md">
          <ShieldAlert className="w-10 h-10 text-purple-700" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-mono font-bold tracking-wider uppercase">
            Error 404 • Resource Not Found
          </span>
          <h1 className="text-3xl font-black text-[#231A12] tracking-tight">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-[#6B5C4D] leading-relaxed max-w-md mx-auto font-medium">
            The cryptographic project workspace, milestone, or page you requested does not exist or may have been relocated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 group"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white hover:bg-purple-50 text-[#231A12] hover:text-purple-700 border border-[#DFD4C3] text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Layers className="w-4 h-4 text-purple-700" />
            <span>Client Dashboard</span>
          </Link>
        </div>

        <div className="pt-6 border-t border-[#EAE1D2] space-y-2 text-xs text-[#7A6C5B]">
          <span className="font-semibold block text-[#4B3F33]">Need immediate assistance?</span>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
            <a
              href="mailto:support@pactflow.io"
              className="hover:text-purple-700 transition-colors inline-flex items-center gap-1.5 text-purple-700 underline"
            >
              <Mail className="w-3.5 h-3.5" /> support@pactflow.io
            </a>
            <span className="text-[#C5B7A6]">•</span>
            <a
              href="tel:+18005557228"
              className="hover:text-amber-800 transition-colors inline-flex items-center gap-1.5 text-amber-800 underline"
            >
              <Phone className="w-3.5 h-3.5" /> +1 (800) 555-7228
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
