'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Layers, ShieldCheck, DollarSign, Calendar, Mail } from 'lucide-react';
import { api } from '../../../lib/api';
import NotificationBanner from '../../../components/NotificationBanner';

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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Create Project | Gemini Pact Architect | PACTFLOW';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Create project
      const project = await api.createProject({
        title,
        description,
        budget: Number(budget),
        currency,
        freelancer_email: freelancerEmail || undefined,
      });

      setSuccessMsg('Project created successfully! Synthesizing milestones with Gemini...');

      // 2. If Gemini Auto-Architect enabled, draft agreement immediately
      if (autoDraftAgreement) {
        try {
          await api.generateAgreement(project.id);
        } catch (agErr: any) {
          console.warn('Agreement generation note:', agErr);
        }
      }

      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project. Please verify input fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2 w-full max-w-full overflow-hidden">
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
          Agreement Specification
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#231A12] tracking-tight">Create Verifiable Project</h1>
        <p className="text-xs sm:text-sm text-[#6B5C4D]">
          Define your project scope and budget. Gemini Pact Architect will convert your specifications into structured milestone criteria.
        </p>
      </div>

      {error && (
        <NotificationBanner
          type="error"
          title="Submission Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {successMsg && (
        <NotificationBanner
          type="success"
          title="Project Synthesized"
          message={successMsg}
        />
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-3xl border border-white/90 shadow-glass space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#4B3F33]">
            Project Title <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project Title (e.g. Enterprise Payment Gateway Integration)"
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
            placeholder="Detail required features, API endpoints, integration boundaries, and acceptance tests. Gemini will extract verifiable criteria from this text."
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

        <div className="p-4 rounded-xl bg-white/70 border border-[#EAE1D2] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
              <Sparkles className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#231A12] block">Enable Gemini Pact Architect</span>
              <span className="text-[11px] text-[#6B5C4D] block font-normal">Auto-synthesize contract milestones & acceptance criteria upon creation</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoDraftAgreement}
            onChange={(e) => setAutoDraftAgreement(e.target.checked)}
            className="w-4 h-4 accent-amber-600 rounded cursor-pointer shrink-0"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 group min-h-[44px]"
        >
          {loading ? 'Synthesizing with Gemini AI...' : 'Create Project & Generate Milestones'}
        </button>
      </form>
    </div>
  );
}
