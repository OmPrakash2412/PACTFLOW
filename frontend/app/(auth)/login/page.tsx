'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Lock, Mail, Sparkles, CheckCircle, Key } from 'lucide-react';
import { api } from '../../../lib/api';
import NotificationBanner from '../../../components/NotificationBanner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('client@pactflow.io');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Sign In | PACTFLOW';
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
      setSuccess(`Authenticated as ${resp.user.full_name || resp.user.role}! Opening workspace...`);
      setTimeout(() => {
        router.push(resp.user.role === 'freelancer' ? '/freelancer' : '/dashboard');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const setRoleQuickly = (role: 'client' | 'freelancer') => {
    if (role === 'client') {
      setEmail('client@pactflow.io');
      setPassword('password123');
    } else {
      setEmail('freelancer@pactflow.io');
      setPassword('password123');
    }
  };

  return (
    <div className="relative max-w-lg mx-auto py-8 sm:py-12 px-3 sm:px-0 w-full overflow-hidden">
      {/* Background glass glows */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-amber-300/30 rounded-full blur-2xl pointer-events-none -z-10" />
      <div className="absolute -bottom-10 -right-10 w-52 h-52 bg-purple-300/30 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center space-y-3 mb-6 sm:mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/25 mx-auto">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-[11px] font-semibold tracking-wide uppercase">
            <Sparkles className="w-3 h-3 text-amber-700" />
            Zero-Escrow Milestone Protocol
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#231A12] mt-2 tracking-tight">
            Sign In to <span className="bg-gradient-to-r from-purple-700 via-indigo-700 to-amber-600 bg-clip-text text-transparent">PACTFLOW</span>
          </h1>
          <p className="text-xs text-[#7A6C5B] font-medium mt-1">
            Where Work Meets Trust • Enter your credentials to access the main site
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <NotificationBanner
            type="error"
            title="Authentication Error"
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}

      {success && (
        <div className="mb-4">
          <NotificationBanner
            type="success"
            title="Session Authorized"
            message={success}
          />
        </div>
      )}

      {/* Glass Form Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/90 shadow-glass space-y-6">
        {/* Quick Demo Selector */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#6B5C4D] uppercase tracking-wider block">
            1-Click Demo Profiles
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setRoleQuickly('client')}
              className={`p-3 rounded-2xl border text-left transition-all backdrop-blur-md min-h-[44px] ${
                email === 'client@pactflow.io'
                  ? 'bg-purple-50/90 border-purple-400/80 shadow-sm ring-2 ring-purple-500/20'
                  : 'bg-white/60 border-[#DFD4C3] hover:bg-white/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#231A12]">Client Profile</span>
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              </div>
              <p className="text-[10px] text-[#7A6C5B] mt-0.5 truncate">client@pactflow.io</p>
            </button>

            <button
              type="button"
              onClick={() => setRoleQuickly('freelancer')}
              className={`p-3 rounded-2xl border text-left transition-all backdrop-blur-md min-h-[44px] ${
                email === 'freelancer@pactflow.io'
                  ? 'bg-amber-50/90 border-amber-400/80 shadow-sm ring-2 ring-amber-500/20'
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
                placeholder="client@pactflow.io"
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
                placeholder="password123"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 group min-h-[44px]"
          >
            {loading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Sign In to PACTFLOW</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-[#EAE1D2] flex items-center justify-between text-xs text-[#7A6C5B]">
          <span>New to the protocol?</span>
          <Link href="/register" className="font-bold text-purple-700 hover:text-purple-900 transition-colors">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
}
