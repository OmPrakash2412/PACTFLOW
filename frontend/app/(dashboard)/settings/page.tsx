'use client';

import React, { useState } from 'react';
import { User, Shield, CreditCard, CheckCircle2, Lock } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <span className="text-xs font-mono text-primary font-bold uppercase tracking-wider">Account & Credentials</span>
        <h1 className="text-3xl font-bold text-white tracking-tight">Platform Settings</h1>
        <p className="text-sm text-slate-400">Configure your profile identity, role views, and PayPal Sandbox settlement addresses.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-8 rounded-2xl border border-navy-800 space-y-6">
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Profile Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-navy-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            PayPal Sandbox Account
          </h2>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Sandbox Payer / Invoicer Email</label>
            <input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs font-mono"
            />
            <span className="text-[11px] text-slate-500 block">
              Used as the primary recipient/invoicer billing identifier in PayPal Sandbox Invoicing API v2 calls.
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-navy-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-secondary" />
            Zero-Trust & Sandbox Architecture
          </h2>
          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 text-xs text-slate-400 space-y-1 font-mono">
            <div>• PayPal Mode: <strong className="text-white">Developer Sandbox (api-m.sandbox.paypal.com)</strong></div>
            <div>• AI Auditor: <strong className="text-white">Google Gemini 2.0 Flash (Structured JSON output)</strong></div>
            <div>• Hash Chain: <strong className="text-white">Deterministic SHA-256 with canonical serialization</strong></div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
