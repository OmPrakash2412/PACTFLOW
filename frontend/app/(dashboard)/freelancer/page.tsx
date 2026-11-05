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
import { Project } from '../../../types';

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
    <div className="space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-[11px] font-semibold tracking-wide uppercase mb-1">
            <Sparkles className="w-3 h-3 text-amber-700" />
            Freelancer Delivery Hub
          </div>
          <h1 className="text-3xl font-black text-[#231A12] tracking-tight">Active Contracts & Submissions</h1>
          <p className="text-[#6B5C4D] text-xs sm:text-sm mt-0.5">Submit deliverable evidence, review Gemini verification audits, and track PayPal settlements.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-2xl glass-card border border-white/90 text-xs font-mono text-[#5A4F43] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>PayPal Sandbox: <strong className="text-[#231A12]">sb-arivera-freelancer@personal.example.com</strong></span>
        </div>
      </div>

      {/* Freelancer KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/90 shadow-glass">
          <div className="text-xs font-mono font-bold text-[#7A6C5B]">SETTLED INVOICES</div>
          <div className="text-2xl font-black text-emerald-700 mt-2">$2,500.00 USD</div>
          <div className="text-xs text-[#6B5C4D] mt-1 font-medium">Milestone 1 captured directly via PayPal</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/90 shadow-glass">
          <div className="text-xs font-mono font-bold text-[#7A6C5B]">APPROVED MILESTONES (PENDING INVOICE)</div>
          <div className="text-2xl font-black text-purple-700 mt-2">$2,500.00 USD</div>
          <div className="text-xs text-[#6B5C4D] mt-1 font-medium">Milestone 2 AI-verified with 94% score</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/90 shadow-glass">
          <div className="text-xs font-mono font-bold text-[#7A6C5B]">IN PROGRESS DELIVERABLE</div>
          <div className="text-2xl font-black text-amber-700 mt-2">$1,500.00 USD</div>
          <div className="text-xs text-[#6B5C4D] mt-1 font-medium">Milestone 3 active delivery</div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="glass-card rounded-3xl border border-white/90 shadow-glass overflow-hidden">
        <div className="p-6 border-b border-[#EAE1D2] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#231A12] flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-700" />
            Active Freelance Engagements
          </h2>
          <span className="text-xs font-mono text-[#7A6C5B] font-semibold">Signed Agreements</span>
        </div>

        <div className="divide-y divide-[#EAE1D2]">
          {projects.map((proj) => (
            <div key={proj.id} className="p-6 hover:bg-white/60 transition-colors space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#231A12]">{proj.title}</h3>
                  <p className="text-xs text-[#6B5C4D] mt-1 font-medium">Client: {proj.client_name || 'Sophia Vance'} | Budget: ${proj.budget} {proj.currency}</p>
                </div>
                <Link
                  href={`/projects/${proj.id}`}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-md shadow-amber-600/20 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Submit Deliverable
                </Link>
              </div>

              {/* Milestones list preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-white/70 border border-[#EAE1D2] space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#231A12]">M1: Architecture</span>
                    <span className="text-emerald-700 font-bold">$2,500</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>PayPal Paid & Ledger Block #2</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 border border-[#EAE1D2] space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#231A12]">M2: AI Engine</span>
                    <span className="text-purple-700 font-bold">$2,500</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                    <span>Client Approved • Invoicing Ready</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 border border-[#EAE1D2] space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#231A12]">M3: PayPal Invoicing</span>
                    <span className="text-amber-700 font-bold">$1,500</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>In Progress • Awaiting Code</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
