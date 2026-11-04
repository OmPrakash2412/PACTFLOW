'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileCheck2,
  Cpu,
  Lock,
  Layers,
  ChevronRight,
  ExternalLink,
  Zap,
  CheckCircle2,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export default function LandingPage() {
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  const workflowSteps = [
    {
      title: "1. Agreement Synthesis",
      actor: "Gemini Pact Architect",
      desc: "Converts requirements and budget into a legally clear, verifiable milestone contract with concrete acceptance criteria.",
      badge: "AI Contract Synthesis"
    },
    {
      title: "2. Dual Acceptance",
      actor: "Client & Freelancer",
      desc: "Both parties digitally sign the exact contract version, sealing an immutable SHA-256 signature event in the Trust Ledger.",
      badge: "Cryptographic Seal"
    },
    {
      title: "3. Deliverable Submission",
      actor: "Freelancer",
      desc: "Code repositories, build artifacts, test runner logs, and live staging URLs are submitted for milestone verification.",
      badge: "Evidence Ingestion"
    },
    {
      title: "4. Objective Evidence Audit",
      actor: "Gemini Evidence Inspector",
      desc: "Analyzes artifacts against agreed criteria. Uses honest assessments ('satisfied', 'uncertain', 'missing') and rejects screenshots for dynamic tests.",
      badge: "Zero-Trust Verification"
    },
    {
      title: "5. Human Approval",
      actor: "Client Decision",
      desc: "Client reviews the AI evidence report and manually approves the milestone or requests revisions. AI never authorizes payouts independently.",
      badge: "Human In The Loop"
    },
    {
      title: "6. PayPal Sandbox Settlement",
      actor: "PayPal Invoicing v2 API",
      desc: "Creates and sends an authoritative PayPal invoice. Status is reconciled via signed webhooks directly into the Trust Ledger.",
      badge: "Settlement Complete"
    }
  ];

  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-8 pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-850 border border-primary/30 text-primary text-xs font-medium shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Next-Gen Freelance Infrastructure with Gemini 2.0 & PayPal Sandbox</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Where Work Meets <span className="bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">Trust.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          AI-powered agreements, objective deliverable verification, and PayPal milestone payment coordination. No escrow ambiguity. Complete cryptographic accountability.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-primary/25 transition-all group"
          >
            Launch Client Hub
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/freelancer"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700/80 font-semibold flex items-center justify-center gap-2.5 transition-all"
          >
            Freelancer Workspace
          </Link>
          <Link
            href="/ledger"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-navy-900/60 hover:bg-navy-850 text-slate-300 border border-navy-800 font-semibold flex items-center justify-center gap-2 transition-all font-mono text-sm"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Inspect Trust Ledger
          </Link>
        </div>

        {/* Live System Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-navy-800/80 text-left">
          <div className="p-4 rounded-xl bg-navy-900/40 border border-navy-800">
            <div className="text-xs font-mono text-primary uppercase tracking-wider">AI Agent A</div>
            <div className="text-base font-bold text-white mt-1">Pact Architect</div>
            <div className="text-xs text-slate-400 mt-1">Structured milestone contracts</div>
          </div>
          <div className="p-4 rounded-xl bg-navy-900/40 border border-navy-800">
            <div className="text-xs font-mono text-secondary uppercase tracking-wider">AI Agent B</div>
            <div className="text-base font-bold text-white mt-1">Evidence Inspector</div>
            <div className="text-xs text-slate-400 mt-1">Objective zero-trust auditor</div>
          </div>
          <div className="p-4 rounded-xl bg-navy-900/40 border border-navy-800">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Payments</div>
            <div className="text-base font-bold text-white mt-1">PayPal Sandbox v2</div>
            <div className="text-xs text-slate-400 mt-1">Authoritative Invoicing & Webhooks</div>
          </div>
          <div className="p-4 rounded-xl bg-navy-900/40 border border-navy-800">
            <div className="text-xs font-mono text-purple-400 uppercase tracking-wider">Security</div>
            <div className="text-base font-bold text-white mt-1">Trust Ledger</div>
            <div className="text-xs text-slate-400 mt-1">SHA-256 immutable hash chain</div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Carousel / Progression */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono text-primary uppercase tracking-wider">Continuous Proof-Of-Work Loop</span>
          <h2 className="text-3xl font-bold text-white tracking-tight">The 6-Step PACTFLOW Lifecycle</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            From project conception to PayPal settlement, every state mutation is mathematically verifiable and protected by human approvals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
            {workflowSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveWorkflowStep(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between ${
                  activeWorkflowStep === idx
                    ? 'bg-navy-850 border-primary shadow-md shadow-primary/10 text-white'
                    : 'bg-navy-900/40 border-navy-800 text-slate-400 hover:bg-navy-850/50 hover:text-slate-200'
                }`}
              >
                <div>
                  <div className="text-xs font-mono text-primary font-semibold">{step.actor}</div>
                  <div className="text-sm font-bold mt-0.5">{step.title}</div>
                </div>
                <ChevronRight className={`w-4 h-4 mt-2 transition-transform ${activeWorkflowStep === idx ? 'rotate-90 text-primary' : 'text-slate-600'}`} />
              </button>
            ))}
          </div>

          <div className="md:col-span-2 glass-panel p-8 rounded-2xl border border-navy-800 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-primary/10 border border-primary/20 text-primary font-medium">
                  {workflowSteps[activeWorkflowStep].badge}
                </span>
                <span className="text-xs font-mono text-slate-400">Step {activeWorkflowStep + 1} of 6</span>
              </div>

              <h3 className="text-2xl font-bold text-white">
                {workflowSteps[activeWorkflowStep].title}
              </h3>

              <p className="text-slate-300 leading-relaxed text-base">
                {workflowSteps[activeWorkflowStep].desc}
              </p>

              {activeWorkflowStep === 3 && (
                <div className="p-4 rounded-xl bg-navy-950 border border-amber-500/20 text-amber-200 text-xs flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-semibold block text-amber-300">Evidence Inspector Principle:</span>
                    Static screenshots are never accepted as proof of working code or interactive servers. Concrete runtime test outputs or live URLs are required.
                  </div>
                </div>
              )}

              {activeWorkflowStep === 5 && (
                <div className="p-4 rounded-xl bg-navy-950 border border-emerald-500/20 text-emerald-200 text-xs flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold block text-emerald-300">Authoritative PayPal Sandbox:</span>
                    Payments are completed via PayPal's official hosted invoicing experience and reconciled via idempotent cryptographic webhooks.
                  </div>
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-navy-800 flex items-center justify-between">
              <Link
                href="/projects/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
                className="text-sm text-primary hover:text-white font-medium flex items-center gap-1.5 transition-colors"
              >
                Inspect Live Seed Project Workspace
                <ExternalLink className="w-4 h-4" />
              </Link>
              <div className="flex gap-2">
                <button
                  disabled={activeWorkflowStep === 0}
                  onClick={() => setActiveWorkflowStep(Math.max(0, activeWorkflowStep - 1))}
                  className="px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-800 text-xs text-slate-300 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={activeWorkflowStep === workflowSteps.length - 1}
                  onClick={() => setActiveWorkflowStep(Math.min(workflowSteps.length - 1, activeWorkflowStep + 1))}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-xs text-white font-medium disabled:opacity-40"
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Architecture Comparison */}
      <section className="glass-panel p-8 rounded-2xl border border-navy-800 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Why PACTFLOW Over Fragmented Tools?</h2>
          <p className="text-sm text-slate-400">Comparing traditional freelance workflows vs PACTFLOW's verifiable coordination architecture.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-800 text-xs font-mono uppercase text-slate-400">
              <tr>
                <th className="py-3 px-4">Dimension</th>
                <th className="py-3 px-4 text-rose-400">Traditional Freelance Process</th>
                <th className="py-3 px-4 text-primary">PACTFLOW Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-slate-300">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Requirement Scoping</td>
                <td className="py-3.5 px-4 text-slate-400">Disorganized chat threads, unformatted emails</td>
                <td className="py-3.5 px-4 text-emerald-400 font-medium">Gemini Pact Architect structured contracts</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Deliverable Review</td>
                <td className="py-3.5 px-4 text-slate-400">Subjective client debates, missing files</td>
                <td className="py-3.5 px-4 text-emerald-400 font-medium">Gemini Evidence Inspector objective criteria audit</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Payment Settlement</td>
                <td className="py-3.5 px-4 text-slate-400">Manual wire requests or risky hold periods</td>
                <td className="py-3.5 px-4 text-emerald-400 font-medium">PayPal Developer Sandbox Invoicing v2 API</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Dispute History</td>
                <td className="py-3.5 px-4 text-slate-400">He-said-she-said screenshot battles</td>
                <td className="py-3.5 px-4 text-emerald-400 font-medium">Cryptographic Trust Ledger (SHA-256 hash chain)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
