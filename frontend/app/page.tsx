'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  Layers,
  FileCheck2,
  DollarSign,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  LogOut,
  User,
  Zap,
  Cpu,
  FolderPlus
} from 'lucide-react';
import { api } from '../lib/api';
import NotificationBanner from '../components/NotificationBanner';

export default function HomeOrLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login form state
  const [email, setEmail] = useState('client@pactflow.io');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Workflow visual tab
  const [showArchitecture, setShowArchitecture] = useState(false);

  useEffect(() => {
    document.title = 'PACTFLOW | Where Work Meets Trust';
    const savedToken = localStorage.getItem('pactflow_token');
    const savedRole = localStorage.getItem('pactflow_role');
    setToken(savedToken);
    setRole(savedRole);
    setCheckingAuth(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const resp = await api.login(email, password);
      localStorage.setItem('pactflow_token', resp.access_token);
      localStorage.setItem('pactflow_role', resp.user.role);
      setToken(resp.access_token);
      setRole(resp.user.role);
      setSuccess(`Authenticated as ${resp.user.full_name || resp.user.role}! Loading workspace...`);

      setTimeout(() => {
        if (resp.user.role === 'freelancer') {
          router.push('/freelancer');
        } else {
          router.push('/dashboard');
        }
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoRole = (selectedRole: 'client' | 'freelancer') => {
    if (selectedRole === 'client') {
      setEmail('client@pactflow.io');
      setPassword('password123');
    } else {
      setEmail('freelancer@pactflow.io');
      setPassword('password123');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pactflow_token');
    localStorage.removeItem('pactflow_role');
    setToken(null);
    setRole(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-stone-800 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // IF ALREADY LOGGED IN: Open Main Site Experience
  if (token) {
    return (
      <div className="space-y-8 py-4 w-full max-w-full overflow-hidden">
        {/* Welcome Back Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#E8DFD3] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Session ({role === 'freelancer' ? 'Freelancer Profile' : 'Client Profile'})
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#231A12] tracking-tight">
              Welcome to the <span className="text-stone-900">PACT</span><span className="text-amber-700">FLOW</span> Workspace
            </h1>
            <p className="text-xs sm:text-sm text-[#6B5C4D]">
              Your cryptographic agreement, milestone verification, and PayPal settlement workspace is ready.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10 w-full sm:w-auto">
            <Link
              href={role === 'freelancer' ? '/freelancer' : '/dashboard'}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all min-h-[44px]"
            >
              <span>Enter Main Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-3 rounded-xl bg-white hover:bg-stone-100 text-[#6B5A49] hover:text-stone-900 border border-[#DFD4C3] text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard"
            className="glass-card glass-card-hover p-6 rounded-2xl border border-[#E8DFD3] shadow-sm space-y-4 group"
          >
            <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-900 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#231A12] group-hover:text-amber-800 transition-colors">Client Hub</h2>
              <p className="text-xs text-[#7A6C5B] mt-1 leading-relaxed">
                Create contracts with Gemini Pact Architect, inspect AI deliverable audits, and trigger PayPal invoices.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 group-hover:text-amber-800">
              Open Client Hub <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/freelancer"
            className="glass-card glass-card-hover p-6 rounded-2xl border border-[#E8DFD3] shadow-sm space-y-4 group"
          >
            <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-amber-800 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#231A12] group-hover:text-amber-800 transition-colors">Freelancer Hub</h2>
              <p className="text-xs text-[#7A6C5B] mt-1 leading-relaxed">
                Submit milestone evidence, review Gemini audit reports, and track PayPal payment releases.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 group-hover:text-amber-800">
              Open Freelancer Hub <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/ledger"
            className="glass-card glass-card-hover p-6 rounded-2xl border border-[#E8DFD3] shadow-sm space-y-4 group"
          >
            <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-emerald-800 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#231A12] group-hover:text-emerald-800 transition-colors">Trust Ledger</h2>
              <p className="text-xs text-[#7A6C5B] mt-1 leading-relaxed">
                Verify cryptographic SHA-256 block chains, tamper detection, and payment event trails.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 group-hover:text-emerald-800">
              Inspect Trust Ledger <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/empty"
            className="glass-card glass-card-hover p-6 rounded-2xl border border-[#E8DFD3] shadow-sm space-y-4 group"
          >
            <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 group-hover:scale-105 transition-transform">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#231A12] group-hover:text-stone-900 transition-colors">Empty States</h2>
              <p className="text-xs text-[#7A6C5B] mt-1 leading-relaxed">
                Review fallback empty states for newly initialized client workspaces and pending contracts.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900">
              Explore Showcase <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // IF NOT LOGGED IN: Clean, Minimalist Login View
  return (
    <div className="relative max-w-4xl mx-auto py-6 sm:py-10 space-y-8 sm:space-y-10 w-full overflow-hidden">
      {/* Header */}
      <div className="text-center space-y-3 px-3">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center shadow-sm mx-auto">
          <ShieldCheck className="w-7 sm:w-8 h-7 sm:h-8 text-amber-500" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-300/80 text-stone-800 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>AI Milestone Verification & PayPal Settlement Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#231A12] tracking-tight">
          Where Work Meets <span className="text-stone-900 underline decoration-amber-500/40 decoration-2 underline-offset-4">Trust.</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#6B5C4D] max-w-xl mx-auto font-normal leading-relaxed">
          Sign in below to unlock your client or freelancer workspace, inspect cryptographic ledgers, and coordinate PayPal milestone settlements.
        </p>
      </div>

      {error && (
        <div className="max-w-md mx-auto px-3">
          <NotificationBanner
            type="error"
            title="Authentication Error"
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}

      {success && (
        <div className="max-w-md mx-auto px-3">
          <NotificationBanner
            type="success"
            title="Session Authorized"
            message={success}
          />
        </div>
      )}

      {/* Login Card */}
      <div className="max-w-md mx-auto px-3 sm:px-0">
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#231A12]">Sign In to PACTFLOW</h2>
            <p className="text-xs text-[#7A6C5B]">Select a demo role profile or enter credentials</p>
          </div>

          {/* Quick Demo Selector */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-semibold text-[#6B5C4D] uppercase tracking-wider block">
              1-Click Demo Profiles
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDemoRole('client')}
                className={`p-3 rounded-xl border text-left transition-all min-h-[44px] ${
                  email === 'client@pactflow.io'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-white/80 border-[#DFD4C3] text-stone-800 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Client</span>
                  <span className={`w-2 h-2 rounded-full ${email === 'client@pactflow.io' ? 'bg-amber-400' : 'bg-stone-400'}`}></span>
                </div>
                <p className={`text-[10px] mt-0.5 truncate ${email === 'client@pactflow.io' ? 'text-stone-300' : 'text-[#7A6C5B]'}`}>client@pactflow.io</p>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('freelancer')}
                className={`p-3 rounded-xl border text-left transition-all min-h-[44px] ${
                  email === 'freelancer@pactflow.io'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-white/80 border-[#DFD4C3] text-stone-800 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Freelancer</span>
                  <span className={`w-2 h-2 rounded-full ${email === 'freelancer@pactflow.io' ? 'bg-amber-400' : 'bg-stone-400'}`}></span>
                </div>
                <p className={`text-[10px] mt-0.5 truncate ${email === 'freelancer@pactflow.io' ? 'text-stone-300' : 'text-[#7A6C5B]'}`}>freelancer@pactflow.io</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4B3F33]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7D6C] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
                  placeholder="client@pactflow.io"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4B3F33]">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C7D6C] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
                  placeholder="password123"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 group min-h-[44px]"
            >
              {loading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In & Open Main Site</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#EAE1D2] flex items-center justify-between text-xs text-[#7A6C5B]">
            <span>Need an account?</span>
            <Link href="/register" className="font-semibold text-stone-900 hover:text-amber-800 transition-colors">
              Register Here
            </Link>
          </div>
        </div>
      </div>

      {/* Protocol Architecture preview toggle */}
      <div className="text-center pt-2 px-3">
        <button
          onClick={() => setShowArchitecture(!showArchitecture)}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#6B5C4D] hover:text-[#231A12] transition-colors p-2"
        >
          <Cpu className="w-4 h-4 text-stone-700 shrink-0" />
          <span>{showArchitecture ? 'Hide Protocol Architecture' : 'View Core 6-Step Verification Workflow'}</span>
        </button>
      </div>

      {showArchitecture && (
        <div className="glass-panel p-5 sm:p-7 rounded-2xl border border-[#E8DFD3] shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3 mx-3 sm:mx-0">
          <div className="p-4 rounded-xl bg-white/70 border border-[#EAE1D2] space-y-1">
            <span className="text-[10px] font-mono font-bold text-stone-700 uppercase">Step 1</span>
            <h3 className="text-xs font-bold text-[#231A12]">Agreement Synthesis</h3>
            <p className="text-[11px] text-[#6B5C4D]">Gemini Pact Architect writes precise acceptance criteria and milestone amounts.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/70 border border-[#EAE1D2] space-y-1">
            <span className="text-[10px] font-mono font-bold text-stone-700 uppercase">Step 2</span>
            <h3 className="text-xs font-bold text-[#231A12]">Dual Signing</h3>
            <p className="text-[11px] text-[#6B5C4D]">Both client and freelancer sign with immutable SHA-256 ledger recording.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/70 border border-[#EAE1D2] space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase">Step 3</span>
            <h3 className="text-xs font-bold text-[#231A12]">Deliverables Ingestion</h3>
            <p className="text-[11px] text-[#6B5C4D]">Freelancer submits repositories, artifacts, SSRF-validated URLs, and test logs.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/70 border border-[#EAE1D2] space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase">Step 4</span>
            <h3 className="text-xs font-bold text-[#231A12]">Evidence Inspector</h3>
            <p className="text-[11px] text-[#6B5C4D]">Gemini audits proof objectively, rejecting fake screenshots for dynamic code.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/70 border border-[#EAE1D2] space-y-1">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Step 5</span>
            <h3 className="text-xs font-bold text-[#231A12]">Human Approval</h3>
            <p className="text-[11px] text-[#6B5C4D]">Client retains sovereign control to approve milestone or request revisions.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/70 border border-[#EAE1D2] space-y-1">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Step 6</span>
            <h3 className="text-xs font-bold text-[#231A12]">PayPal Settlement</h3>
            <p className="text-[11px] text-[#6B5C4D]">PayPal Invoicing v2 API generates invoice, finalized by webhook confirmation.</p>
          </div>
        </div>
      )}

      {/* Direct Contact Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card border border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mx-3 sm:mx-0">
        <div className="flex items-center gap-2 text-[#6B5C4D]">
          <Mail className="w-4 h-4 text-stone-700" />
          <span>Questions or inquiries? Connect with our team:</span>
        </div>
        <div className="flex items-center gap-4 font-semibold">
          <a
            href="mailto:support@pactflow.io"
            className="text-stone-900 hover:text-amber-800 underline inline-flex items-center gap-1"
          >
            support@pactflow.io
          </a>
          <span className="text-[#DFD4C3]">•</span>
          <a
            href="tel:+18005557228"
            className="text-amber-800 hover:text-amber-950 underline inline-flex items-center gap-1"
          >
            +1 (800) 555-7228
          </a>
        </div>
      </div>
    </div>
  );
}
