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
  Sparkles,
  Mail,
  Phone
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Project } from '../../../types';
import EmptyState from '../../../components/EmptyState';
import NotificationBanner from '../../../components/NotificationBanner';

export default function FreelancerDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Freelancer Hub | PACTFLOW';
    async function load() {
      try {
        const data = await api.getProjects();
        setProjects(data);
      } catch (e: any) {
        console.warn(e);
        setErrorNotice(e.message || 'Unable to connect to local backend API.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 py-2 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-[11px] font-semibold tracking-wide uppercase mb-1">
            <Sparkles className="w-3 h-3 text-amber-700" />
            Freelancer Delivery Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#231A12] tracking-tight">Active Contracts & Submissions</h1>
          <p className="text-[#6B5C4D] text-xs sm:text-sm mt-0.5">
            Submit deliverable evidence, review Gemini verification audits, and track PayPal settlements.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-2xl glass-card border border-white/90 text-xs font-mono text-[#5A4F43] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>PayPal Sandbox: <strong className="text-[#231A12]">sb-arivera-freelancer@personal.example.com</strong></span>
        </div>
      </div>

      {errorNotice && (
        <NotificationBanner
          type="warning"
          title="Notice"
          message={errorNotice}
          onClose={() => setErrorNotice(null)}
        />
      )}

      {/* Freelancer KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/90 shadow-glass">
          <div className="text-xs font-mono font-bold text-[#7A6C5B]">SETTLED INVOICES</div>
          <div className="text-2xl font-black text-emerald-700 mt-2">$2,500.00 USD</div>
          <div className="text-xs text-[#6B5C4D] mt-1 font-medium">Milestone 1 captured directly via PayPal</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[#E8DFD3] shadow-sm">
          <div className="text-xs font-mono font-bold text-[#7A6C5B]">APPROVED MILESTONES (PENDING INVOICE)</div>
          <div className="text-2xl font-black text-stone-900 mt-2">$2,500.00 USD</div>
          <div className="text-xs text-[#6B5C4D] mt-1 font-medium">Milestone 2 AI-verified with 94% score</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/90 shadow-glass">
          <div className="text-xs font-mono font-bold text-[#7A6C5B]">IN PROGRESS DELIVERABLE</div>
          <div className="text-2xl font-black text-amber-700 mt-2">$1,500.00 USD</div>
          <div className="text-xs text-[#6B5C4D] mt-1 font-medium">Milestone 3 active delivery</div>
        </div>
      </div>

      {/* Contracts List or Empty State */}
      <div className="glass-card rounded-3xl border border-white/90 shadow-glass overflow-hidden">
        <div className="p-6 border-b border-[#EAE1D2] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#231A12] flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-700" />
            Active Freelance Engagements
          </h2>
          <span className="text-xs font-mono text-[#7A6C5B] font-semibold">
            {projects.length} Signed Agreement(s)
          </span>
        </div>

        {projects.length === 0 && !loading ? (
          <EmptyState
            icon={FileText}
            title="No Assigned Engagements"
            description="You do not have any active freelance contracts assigned to your email yet. When a client adds you as a project contributor, the milestones will appear here."
            actionLabel="Return to Client Hub"
            actionHref="/dashboard"
          />
        ) : (
          <div className="divide-y divide-[#EAE1D2]">
            {projects.map((proj) => (
              <div key={proj.id} className="p-5 sm:p-6 hover:bg-white/60 transition-colors space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#231A12]">{proj.title}</h3>
                    <p className="text-xs text-[#6B5C4D] mt-1 font-medium">
                      Client: {proj.client_name || 'Sophia Vance'} | Budget: ${proj.budget} {proj.currency}
                    </p>
                  </div>
                  <Link
                    href={`/projects/${proj.id}`}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-2 self-start sm:self-auto shadow-sm transition-all min-h-[40px]"
                  >
                    <Upload className="w-4 h-4" />
                    Submit Deliverable
                  </Link>
                </div>

                {/* Milestones list preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-white/70 border border-[#EAE1D2] space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#231A12]">M1: Architecture</span>
                      <span className="text-emerald-700 font-bold">$2,500</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>PayPal Paid & Ledger Block #2</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/70 border border-[#EAE1D2] space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#231A12]">M2: AI Engine</span>
                      <span className="text-stone-900 font-bold">$2,500</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                      <span>Client Approved • Invoicing Ready</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/70 border border-[#EAE1D2] space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#231A12]">M3: PayPal Invoicing</span>
                      <span className="text-amber-700 font-bold">$1,500</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>In Progress • Awaiting Code</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Freelancer Help Desk */}
      <div className="p-5 rounded-2xl glass-card border border-[#E8DFD3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-bold text-[#231A12] block">Freelancer Settlement Support</span>
          <span className="text-[#6B5C4D] block mt-0.5">Have questions regarding PayPal invoice receipts or Gemini deliverable verification?</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="mailto:support@pactflow.io"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#DFD4C3] text-stone-900 hover:text-amber-800 font-semibold inline-flex items-center gap-1.5 shadow-sm"
          >
            <Mail className="w-3.5 h-3.5" /> support@pactflow.io
          </a>
          <a
            href="tel:+18005557228"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#DFD4C3] text-amber-800 hover:text-amber-950 font-semibold inline-flex items-center gap-1.5 shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" /> Call Support
          </a>
        </div>
      </div>
    </div>
  );
}
