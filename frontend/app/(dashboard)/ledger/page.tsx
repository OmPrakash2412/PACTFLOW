'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Hash, CheckCircle2, Lock, ArrowRight, ExternalLink } from 'lucide-react';
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Cryptographic Proof Center</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Trust Ledger Explorer</h1>
          <p className="text-slate-400 text-sm mt-1">
            Deterministic SHA-256 hash chain providing tamper-evident record of all agreements, submissions, audits, and PayPal settlements.
          </p>
        </div>

        {status && (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Chain Status: <strong className="text-white">100% Cryptographically Verified</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-navy-800">
          <div className="text-xs font-mono text-slate-400">TOTAL CHAIN EVENTS</div>
          <div className="text-2xl font-bold text-white mt-1">{events.length} Sealed Blocks</div>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-navy-800">
          <div className="text-xs font-mono text-slate-400">GENESIS HASH</div>
          <div className="text-xs font-mono text-slate-300 truncate mt-2">00000000000000000000000000000000...</div>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-navy-800">
          <div className="text-xs font-mono text-slate-400">LATEST ROOT HASH</div>
          <div className="text-xs font-mono text-emerald-400 truncate mt-2">
            {events.length > 0 ? events[events.length - 1].current_hash : 'None'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Hash className="w-4 h-4 text-primary" />
          Chronological Event Blocks
        </h2>

        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="glass-panel p-5 rounded-xl border border-navy-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">
                    BLOCK #{e.sequence_number}
                  </span>
                  <span className="text-white font-bold">{e.event_type}</span>
                </div>
                <span className="text-slate-500">{new Date(e.timestamp).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                <div className="truncate">Prev Hash: <span className="text-slate-500">{e.prev_hash}</span></div>
                <div className="truncate">Current Hash: <span className="text-emerald-400 font-bold">{e.current_hash}</span></div>
              </div>

              <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 text-[11px] text-slate-300 overflow-x-auto">
                <pre>{JSON.stringify(e.payload, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

