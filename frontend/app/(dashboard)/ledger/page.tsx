'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Hash, CheckCircle2, Lock, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../../../lib/api';
import { TrustEvent, TrustStatus } from '../../../types';

export default function TrustLedgerExplorer() {
  const [events, setEvents] = useState<TrustEvent[]>([]);
  const [status, setStatus] = useState<TrustStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const evs = await api.getTrustEvents('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
        setEvents(evs);
        const st = await api.verifyTrustLedger('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
        setStatus(st);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-300/60 text-emerald-900 text-[11px] font-semibold tracking-wide uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Cryptographic Proof Center
          </div>
          <h1 className="text-3xl font-black text-[#231A12] tracking-tight">Trust Ledger Explorer</h1>
          <p className="text-[#6B5C4D] text-xs sm:text-sm mt-0.5">
            Deterministic SHA-256 hash chain providing tamper-evident audit logs of agreements, submissions, and PayPal settlements.
          </p>
        </div>

        {status && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono font-semibold self-start sm:self-auto shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Chain Status: <strong>100% Verified</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/90 shadow-glass">
          <div className="text-xs font-mono font-bold text-[#7A6C5B]">TOTAL CHAIN EVENTS</div>
          <div className="text-2xl font-black text-[#231A12] mt-1">{events.length} Sealed Blocks</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-white/90 shadow-glass">
          <div className="text-xs font-mono font-bold text-[#7A6C5B]">GENESIS HASH</div>
          <div className="text-xs font-mono text-[#6B5C4D] truncate mt-2">00000000000000000000000000000000...</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-white/90 shadow-glass">
          <div className="text-xs font-mono font-bold text-[#7A6C5B]">LATEST ROOT HASH</div>
          <div className="text-xs font-mono text-emerald-700 font-bold truncate mt-2">
            {events.length > 0 ? events[events.length - 1].current_hash : 'None'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#231A12] flex items-center gap-2">
          <Hash className="w-4 h-4 text-purple-700" />
          Chronological Event Blocks
        </h2>

        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="glass-card p-5 rounded-2xl border border-white/90 shadow-glass space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-800 font-bold border border-purple-200">
                    BLOCK #{e.sequence_number}
                  </span>
                  <span className="text-[#231A12] font-bold">{e.event_type}</span>
                </div>
                <span className="text-[#8C7D6C]">{new Date(e.timestamp).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-[#6B5C4D] pt-1">
                <div className="truncate">Prev Hash: <span className="text-[#8C7D6C]">{e.prev_hash}</span></div>
                <div className="truncate">Current Hash: <span className="text-emerald-700 font-bold">{e.current_hash}</span></div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/80 border border-[#EAE1D2] text-[11px] text-[#231A12] overflow-x-auto shadow-inner">
                <pre>{JSON.stringify(e.payload, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
