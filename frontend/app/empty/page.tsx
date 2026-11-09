'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Layers, FileText, ShieldCheck, CreditCard } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

export default function EmptyShowcasePage() {
  return (
    <div className="space-y-8 py-2">
      <div className="flex items-center justify-between border-b border-[#EAE1D2] pb-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#7A6C5B] hover:text-[#231A12] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-[#231A12] tracking-tight">Empty State Previews</h1>
          <p className="text-xs sm:text-sm text-[#6B5C4D]">
            Production interface states when zero contracts, milestones, or invoices exist.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmptyState
          icon={Layers}
          title="No Active Client Projects"
          description="Your client workspace currently has no registered projects. Use the Gemini Pact Architect to draft your first verifiable milestone contract."
          actionLabel="Create Project with Gemini"
          actionHref="/projects/new"
          secondaryLabel="View Trust Ledger"
          secondaryHref="/ledger"
        />

        <EmptyState
          icon={FileText}
          title="No Freelancer Engagements"
          description="You have not been assigned to any client projects yet. Once a client enters your billing email during agreement synthesis, the contract will appear here."
          actionLabel="Open Client Hub"
          actionHref="/dashboard"
          secondaryLabel="Platform Documentation"
          secondaryHref="/empty"
        />

        <EmptyState
          icon={CreditCard}
          title="No Invoices Dispatched"
          description="Milestone payments are only triggered after client human approval. Once you approve a deliverable audit, authoritative PayPal Invoicing v2 links are minted here."
          actionLabel="Review Milestones"
          actionHref="/dashboard"
        />

        <EmptyState
          icon={ShieldCheck}
          title="Genesis Block Pending"
          description="The Trust Ledger initializes automatically when the client and freelancer execute their dual digital signatures on the contract version."
          actionLabel="Return to Hub"
          actionHref="/dashboard"
        />
      </div>
    </div>
  );
}
