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
  Layers,
  FileCheck2,
  DollarSign,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  LogOut,
  User,
  Zap,
  Cpu
} from 'lucide-react';
import { api } from '../lib/api';

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

  // Workflow visual tab
  const [showArchitecture, setShowArchitecture] = useState(false);

  useEffect(() => {
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

    try {
      const resp = await api.login(email, password);
      localStorage.setItem('pactflow_token', resp.access_token);
      localStorage.setItem('pactflow_role', resp.user.role);
      setToken(resp.access_token);
      setRole(resp.user.role);

      // Route immediately into the main site
      if (resp.user.role === 'freelancer') {
        router.push('/freelancer');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
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
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // IF ALREADY LOGGED IN: Open Main Site Experience
  if (token) {
    return (
      <div className="space-y-12 py-6">
        {/* Welcome Back Glass Banner */}
        <div className="glass-card p-8 rounded-3xl border border-white/90 shadow-glass flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Authenticated Session Active ({role === 'freelancer' ? 'Freelancer' : 'Client'})
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#231A12] tracking-tight">
              Welcome to the <span className="bg-gradient-to-r from-purple-700 via-indigo-700 to-amber-600 bg-clip-text text-transparent">PACTFLOW</span> Portal
            </h1>
            <p className="text-sm text-[#6B5C4D] max-w-xl">
              Your cryptographic agreement, milestone verification, and PayPal settlement workspace is ready.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10">
            <Link
              href={role === 'freelancer' ? '/freelancer' : '/dashboard'}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all"
            >
              Enter Main Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-3 rounded-2xl bg-white/80 hover:bg-rose-50 text-[#6B5A49] hover:text-rose-700 border border-[#DFD4C3] hover:border-rose-200 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard"
            className="glass-card glass-card-hover p-6 rounded-3xl border border-white/90 shadow-glass space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#231A12] group-hover:text-purple-700 transition-colors">Client Hub</h2>
              <p className="text-xs text-[#7A6C5B] mt-1 leading-relaxed">
                Create contracts with Gemini Pact Architect, inspect AI deliverable audits, and trigger PayPal invoices.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-purple-700">
              Open Client Hub <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/freelancer"
            className="glass-card glass-card-hover p-6 rounded-3xl border border-white/90 shadow-glass space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#231A12] group-hover:text-amber-800 transition-colors">Freelancer Hub</h2>
              <p className="text-xs text-[#7A6C5B] mt-1 leading-relaxed">
                Submit milestone evidence, review Gemini audit reports, and track PayPal payment releases.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-800">
              Open Freelancer Hub <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/ledger"
            className="glass-card glass-card-hover p-6 rounded-3xl border border-white/90 shadow-glass space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#231A12] group-hover:text-emerald-800 transition-colors">Trust Ledger</h2>
              <p className="text-xs text-[#7A6C5B] mt-1 leading-relaxed">
                Verify cryptographic SHA-256 block chains, tamper detection, and payment event trails.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
              Inspect Trust Ledger <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // IF NOT LOGGED IN: First Login Page Flow with Beige Glassmorphism
  return (
    <div className="relative max-w-4xl mx-auto py-8 space-y-10">
      {/* Decorative Warm Glass Glowing Spheres */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-amber-300/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-purple-300/25 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Glass Portal Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mx-auto">
          <ShieldCheck className="w-9 h-9 text-white" />
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>AI-Powered Milestone Coordination & PayPal Sandbox</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#231A12] tracking-tight">
          Where Work Meets <span className="bg-gradient-to-r from-purple-700 via-indigo-700 to-amber-600 bg-clip-text text-transparent">Trust.</span>
        </h1>
        <p className="text-sm sm:text-base text-[#6B5C4D] max-w-xl mx-auto font-medium">
          Sign in below to unlock your client or freelancer workspace, inspect cryptographic ledgers, and coordinate PayPal milestone settlements.
        </p>
      </div>

      {/* Glass Login Card */}
      <div className="max-w-md mx-auto">
        <div className="glass-card p-8 sm:p-9 rounded-3xl border border-white/90 shadow-glass space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-[#231A12]">Sign In to PACTFLOW</h2>
            <p className="text-xs text-[#7A6C5B] font-medium">Select a role or enter your credentials</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs font-semibold backdrop-blur-md">
              {error}
            </div>
          )}

          {/* Quick Demo Selector */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[#6B5C4D] uppercase tracking-wider block">
              1-Click Demo Profiles
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDemoRole('client')}
                className={`p-3 rounded-2xl border text-left transition-all backdrop-blur-md ${
                  email === 'client@pactflow.io'
                    ? 'bg-purple-50/90 border-purple-400 shadow-sm ring-2 ring-purple-500/20'
                    : 'bg-white/60 border-[#DFD4C3] hover:bg-white/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#231A12]">Client</span>
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                </div>
                <p className="text-[10px] text-[#7A6C5B] mt-0.5 truncate">client@pactflow.io</p>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('freelancer')}
                className={`p-3 rounded-2xl border text-left transition-all backdrop-blur-md ${
                  email === 'freelancer@pactflow.io'
                    ? 'bg-amber-50/90 border-amber-400 shadow-sm ring-2 ring-amber-500/20'
                    : 'bg-white/60 border-[#DFD4C3] hover:bg-white/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#231A12]">Freelancer</span>
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                </div>
                <p className="text-[10px] text-[#7A6C5B] mt-0.5 truncate">freelancer@pactflow.io</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4B3F33]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7D6C] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4B3F33]">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C7D6C] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span>Authenticating & Opening Site...</span>
              ) : (
                <>
                  <span>Sign In & Open Main Site</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#EAE1D2] flex items-center justify-between text-xs text-[#7A6C5B]">
            <span>Need an account?</span>
            <Link href="/register" className="font-bold text-purple-700 hover:text-purple-900 transition-colors">
              Register Here
            </Link>
          </div>
        </div>
      </div>

      {/* Protocol Architecture preview toggle */}
      <div className="text-center pt-4">
        <button
          onClick={() => setShowArchitecture(!showArchitecture)}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#6B5C4D] hover:text-[#231A12] transition-colors"
        >
          <Cpu className="w-4 h-4 text-purple-600" />
          <span>{showArchitecture ? 'Hide Protocol Architecture' : 'View Core 6-Step Verification Workflow'}</span>
        </button>
      </div>

      {showArchitecture && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/90 shadow-glass grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div className="p-4 rounded-2xl bg-white/70 border border-[#EAE1D2] space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-purple-700 uppercase">Step 1</span>
            <h3 className="text-sm font-bold text-[#231A12]">Agreement Synthesis</h3>
            <p className="text-xs text-[#6B5C4D]">Gemini Pact Architect writes precise acceptance criteria and milestone amounts.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 border border-[#EAE1D2] space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-purple-700 uppercase">Step 2</span>
            <h3 className="text-sm font-bold text-[#231A12]">Dual Signing</h3>
            <p className="text-xs text-[#6B5C4D]">Both client and freelancer sign with immutable SHA-256 ledger recording.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 border border-[#EAE1D2] space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase">Step 3</span>
            <h3 className="text-sm font-bold text-[#231A12]">Deliverables Ingestion</h3>
            <p className="text-xs text-[#6B5C4D]">Freelancer submits repositories, artifacts, SSRF-validated URLs, and test logs.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 border border-[#EAE1D2] space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase">Step 4</span>
            <h3 className="text-sm font-bold text-[#231A12]">Evidence Inspector</h3>
            <p className="text-xs text-[#6B5C4D]">Gemini audits proof objectively, rejecting fake screenshots for dynamic code.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 border border-[#EAE1D2] space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Step 5</span>
            <h3 className="text-sm font-bold text-[#231A12]">Human Approval</h3>
            <p className="text-xs text-[#6B5C4D]">Client retains sovereign control to approve milestone or request revisions.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 border border-[#EAE1D2] space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Step 6</span>
            <h3 className="text-sm font-bold text-[#231A12]">PayPal Settlement</h3>
            <p className="text-xs text-[#6B5C4D]">PayPal Invoicing v2 API generates invoice, finalized by webhook confirmation.</p>
          </div>
        </div>
      )}
    </div>
  );
}
