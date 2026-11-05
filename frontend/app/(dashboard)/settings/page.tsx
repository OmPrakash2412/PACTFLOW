'use client';

import React, { useState } from 'react';
import { User, Shield, CreditCard, CheckCircle2, Lock, Sparkles } from 'lucide-react';

export default function UserSettings() {
  const [name, setName] = useState('Sophia Vance');
  const [email, setEmail] = useState('client@pactflow.io');
  const [paypalEmail, setPaypalEmail] = useState('sb-svance-client@business.example.com');
  const [role, setRole] = useState<'client' | 'freelancer' | 'admin'>('client');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-[11px] font-semibold tracking-wide uppercase mb-1">
          <Sparkles className="w-3 h-3 text-amber-700" />
          Account & Credentials
        </div>
        <h1 className="text-3xl font-black text-[#231A12] tracking-tight">Platform Settings</h1>
        <p className="text-xs sm:text-sm text-[#6B5C4D]">Configure your profile identity, role views, and PayPal Sandbox settlement addresses.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card p-8 rounded-3xl border border-white/90 shadow-glass space-y-6">
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#231A12] flex items-center gap-2">
            <User className="w-4 h-4 text-purple-700" />
            Profile Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4B3F33]">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4B3F33]">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#EAE1D2] space-y-4">
          <h2 className="text-base font-bold text-[#231A12] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-700" />
            PayPal Sandbox Account
          </h2>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#4B3F33]">Sandbox Payer / Invoicer Email</label>
            <input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono font-medium text-[#231A12]"
            />
            <span className="text-[11px] text-[#7A6C5B] block font-medium">
              Used as the primary recipient/invoicer billing identifier in PayPal Sandbox Invoicing API v2 calls.
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#EAE1D2] space-y-4">
          <h2 className="text-base font-bold text-[#231A12] flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700" />
            Zero-Trust & Sandbox Architecture
          </h2>
          <div className="p-4 rounded-2xl bg-white/70 border border-[#EAE1D2] text-xs text-[#5A4F43] space-y-1 font-mono">
            <div>• PayPal Mode: <strong className="text-[#231A12]">Developer Sandbox (api-m.sandbox.paypal.com)</strong></div>
            <div>• AI Auditor: <strong className="text-[#231A12]">Google Gemini 2.0 Flash (Structured JSON output)</strong></div>
            <div>• Hash Chain: <strong className="text-[#231A12]">Deterministic SHA-256 with canonical serialization</strong></div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
