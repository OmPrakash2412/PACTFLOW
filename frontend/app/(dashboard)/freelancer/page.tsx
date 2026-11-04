'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Project, Milestone } from '../../../types';

export default function FreelancerDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getProjects();
        setProjects(data);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-secondary font-medium uppercase tracking-wider">Freelancer Delivery Hub</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Active Contracts & Submissions</h1>
          <p className="text-slate-400 text-sm mt-1">Submit deliverable evidence, review Gemini verification audits, and track PayPal settlements.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-800 text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          PayPal Sandbox Account: sb-arivera-freelancer@personal.example.com
        </div>
      </div>

      {/* Freelancer KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-navy-800">
          <div className="text-xs font-mono text-slate-400">SETTLED INVOICES</div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">$2,500.00 USD</div>
          <div className="text-xs text-slate-400 mt-1">Milestone 1 captured directly via PayPal</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-navy-800">
          <div className="text-xs font-mono text-slate-400">APPROVED MILESTONES (PENDING INVOICE)</div>
          <div className="text-2xl font-bold text-primary mt-2">$2,500.00 USD</div>
          <div className="text-xs text-slate-400 mt-1">Milestone 2 AI-verified with 94% score</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-navy-800">
          <div className="text-xs font-mono text-slate-400">IN PROGRESS DELIVERABLE</div>
          <div className="text-2xl font-bold text-secondary mt-2">$1,500.00 USD</div>
          <div className="text-xs text-slate-400 mt-1">Milestone 3 active delivery</div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="glass-panel rounded-xl border border-navy-800 overflow-hidden">
        <div className="p-5 border-b border-navy-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-secondary" />
            Active Freelance Engagements
          </h2>
          <span className="text-xs font-mono text-slate-400">Signed Agreements</span>
        </div>

        <div className="divide-y divide-navy-800/60">
          {projects.map((proj) => (
            <div key={proj.id} className="p-6 hover:bg-navy-900/30 transition-colors space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">Client: {proj.client_name || 'Sophia Vance'} | Budget: ${proj.budget} {proj.currency}</p>
                </div>
                <Link
                  href={`/projects/${proj.id}`}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Submit Deliverable
                </Link>
              </div>

              {/* Milestones timeline snippet */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-navy-950 border border-emerald-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-emerald-400 font-bold">Milestone 1</span>
                    <span className="text-slate-400">$2,500</span>
                  </div>
                  <div className="text-slate-200 font-medium">Architecture Blueprint & Ingestion</div>
                  <div className="text-[11px] text-emerald-400/90 font-mono">✓ Settled via PayPal</div>
                </div>

                <div className="p-3 rounded-lg bg-navy-950 border border-primary/30 text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-primary font-bold">Milestone 2</span>
                    <span className="text-slate-400">$2,500</span>
                  </div>
                  <div className="text-slate-200 font-medium">AI Verification Engine & Frontend</div>
                  <div className="text-[11px] text-primary/90 font-mono">✓ Client Approved (Awaiting Invoice)</div>
                </div>

                <div className="p-3 rounded-lg bg-navy-950 border border-secondary/30 text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-secondary font-bold">Milestone 3</span>
                    <span className="text-slate-400">$1,500</span>
                  </div>
                  <div className="text-slate-200 font-medium">PayPal Sandbox Invoicing & Webhook Ledger</div>
                  <div className="text-[11px] text-secondary font-mono">→ Ready for Evidence Submission</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
