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
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#7A6C5B] hover:text-[#231A12] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-[11px] font-semibold tracking-wide uppercase mb-1">
          <Sparkles className="w-3 h-3 text-amber-700" />
          New Agreement Specification
        </div>
        <h1 className="text-3xl font-black text-[#231A12] tracking-tight">Create Verifiable Project</h1>
        <p className="text-xs sm:text-sm text-[#6B5C4D]">
          Define your project scope and budget. Gemini Pact Architect will convert your specifications into structured milestone criteria.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold backdrop-blur-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl border border-white/90 shadow-glass space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#4B3F33]">
            Project Title <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Next-Gen Realtime DeFi Portfolio Tracker"
            className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#4B3F33]">
            Requirements & Technical Scope <span className="text-rose-600">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe deliverables, architecture preferences, required integrations, and SLAs. Gemini will extract verifiable criteria from this text."
            className="w-full px-4 py-3 rounded-xl glass-input text-xs font-medium text-[#231A12]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#4B3F33]">
              Total Committed Budget (USD) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-[#8C7D6C] absolute left-3.5 top-3" />
              <input
                type="number"
                required
                min={100}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-bold text-[#231A12]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#4B3F33]">
              Invited Freelancer Email (Optional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C7D6C] absolute left-3.5 top-3" />
              <input
                type="email"
                value={freelancerEmail}
                onChange={(e) => setFreelancerEmail(e.target.value)}
                placeholder="freelancer@pactflow.io"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
              />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 border border-[#EAE1D2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#231A12] block">Enable Gemini Pact Architect</span>
              <span className="text-[11px] text-[#6B5C4D] block font-medium">Auto-synthesize contract milestones & acceptance criteria upon creation</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoDraftAgreement}
            onChange={(e) => setAutoDraftAgreement(e.target.checked)}
            className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 group"
        >
          {loading ? 'Synthesizing with Gemini AI...' : 'Create Project & Generate Milestones'}
        </button>
      </form>
    </div>
  );
}
