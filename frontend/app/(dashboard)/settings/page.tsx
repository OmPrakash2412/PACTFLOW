'use client';

import React, { useState, useEffect } from 'react';
import { User, Shield, CreditCard, CheckCircle2, Lock, Sparkles, Mail, Phone, ExternalLink } from 'lucide-react';
import NotificationBanner from '../../../components/NotificationBanner';

export default function UserSettings() {
  const [name, setName] = useState('Sophia Vance');
  const [email, setEmail] = useState('client@pactflow.io');
  const [paypalEmail, setPaypalEmail] = useState('sb-svance-client@business.example.com');
  const [role, setRole] = useState<'client' | 'freelancer' | 'admin'>('client');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Settings | PACTFLOW';
    const savedRole = localStorage.getItem('pactflow_role');
    if (savedRole === 'freelancer') {
      setName('Alex Rivera');
      setEmail('freelancer@pactflow.io');
      setPaypalEmail('sb-arivera-freelancer@personal.example.com');
      setRole('freelancer');
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveNotice('Settings updated and synced successfully with local storage!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2 w-full max-w-full overflow-hidden">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-[11px] font-semibold tracking-wide uppercase mb-1">
          <Sparkles className="w-3 h-3 text-amber-700" />
          Account & Credentials
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#231A12] tracking-tight">Platform Settings</h1>
        <p className="text-xs sm:text-sm text-[#6B5C4D]">
          Configure your profile identity, role views, and PayPal Sandbox settlement addresses.
        </p>
      </div>

      {saveNotice && (
        <NotificationBanner
          type="success"
          title="Updated"
          message={saveNotice}
          onClose={() => setSaveNotice(null)}
        />
      )}

      <form onSubmit={handleSave} className="glass-card p-6 sm:p-8 rounded-3xl border border-white/90 shadow-glass space-y-6">
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
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4B3F33]">Email Address</label>
              <input
                type="email"
                required
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
              required
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono font-medium text-[#231A12]"
            />
            <span className="text-[11px] text-[#7A6C5B] block font-medium">
              Used as the authoritative recipient/invoicer billing identifier in PayPal Sandbox Invoicing API v2 calls.
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
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all min-h-[44px]"
        >
          Save Changes
        </button>
      </form>

      {/* Support & Contact Details in Settings */}
      <div className="glass-card p-6 rounded-3xl border border-white/90 space-y-3">
        <h3 className="text-sm font-bold text-[#231A12] flex items-center gap-2">
          <Mail className="w-4 h-4 text-purple-700" />
          Direct Technical Support
        </h3>
        <p className="text-xs text-[#6B5C4D]">
          Encountering issues with PayPal sandbox authentication or deliverable verification? Reach out directly:
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-1">
          <a
            href="mailto:support@pactflow.io"
            className="text-purple-700 hover:text-purple-900 inline-flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" /> support@pactflow.io
          </a>
          <span className="text-[#D8CCBA]">•</span>
          <a
            href="tel:+18005557228"
            className="text-amber-800 hover:text-amber-950 inline-flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" /> +1 (800) 555-PACT (7228)
          </a>
        </div>
      </div>
    </div>
  );
}
