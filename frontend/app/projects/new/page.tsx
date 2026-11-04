'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Layers, ShieldCheck, DollarSign, Calendar, Mail } from 'lucide-react';
import { api } from '../../../lib/api';

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState(5000);
  const [currency, setCurrency] = useState('USD');
  const [freelancerEmail, setFreelancerEmail] = useState('');
  const [autoDraftAgreement, setAutoDraftAgreement] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create project
      const project = await api.createProject({
        title,
        description,
        budget: Number(budget),
        currency,
        freelancer_email: freelancerEmail || undefined,
      });

      // 2. If Gemini Auto-Architect enabled, draft agreement immediately
      if (autoDraftAgreement) {
        try {
          await api.generateAgreement(project.id);
        } catch (agErr) {
          console.warn('Agreement generation note:', agErr);
        }
      }

      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="space-y-1">
        <span className="text-xs font-mono text-primary font-medium uppercase tracking-wider">New Agreement Specification</span>
        <h1 className="text-3xl font-bold text-white tracking-tight">Create Verifiable Project</h1>
        <p className="text-sm text-slate-400">
          Define your project scope and budget. Gemini Pact Architect will convert your specifications into structured milestone criteria.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl border border-navy-800 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Project Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Next-Gen Realtime DeFi Portfolio Tracker"
            className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Requirements & Technical Scope <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe deliverables, architecture preferences, required integrations, and SLAs. Gemini will extract verifiable criteria from this text."
            className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary text-sm leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Total Budget (USD) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">$</span>
              <input
                type="number"
                required
                min={50}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white focus:outline-none focus:border-primary text-sm font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Invite Freelancer Email (Optional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={freelancerEmail}
                onChange={(e) => setFreelancerEmail(e.target.value)}
                placeholder="freelancer@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary text-sm"
              />
            </div>
          </div>
        </div>

        {/* Gemini Auto-Architect Switch */}
        <div className="p-4 rounded-xl bg-navy-950 border border-primary/30 flex items-start gap-3">
          <input
            type="checkbox"
            id="gemini-toggle"
            checked={autoDraftAgreement}
            onChange={(e) => setAutoDraftAgreement(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-navy-700 bg-navy-900 text-primary focus:ring-primary"
          />
          <label htmlFor="gemini-toggle" className="text-xs space-y-1 cursor-pointer">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Synthesize Structured Agreement via Gemini Pact Architect
            </span>
            <span className="text-slate-400 block">
              Gemini will immediately generate milestones, budget allocations, objective test criteria, assumptions, and clarification questions.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !title || !description}
          className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 transition-all text-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2 font-mono">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Synthesizing Project & Agreement...
            </span>
          ) : (
            <>
              <Layers className="w-4 h-4" />
              Create Project & Launch Workspace
            </>
          )}
        </button>
      </form>
    </div>
  );
}

