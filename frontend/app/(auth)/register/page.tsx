'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Lock, Mail, User, Sparkles } from 'lucide-react';
import { api } from '../../../lib/api';
import NotificationBanner from '../../../components/NotificationBanner';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Create Account | PACTFLOW';
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const resp = await api.register({
        full_name: fullName,
        email,
        password,
        role,
      });
      localStorage.setItem('pactflow_token', resp.access_token);
      localStorage.setItem('pactflow_role', resp.user.role);
      setSuccess('Account created successfully! Launching your hub...');
      setTimeout(() => {
        router.push(role === 'freelancer' ? '/freelancer' : '/dashboard');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please review your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-lg mx-auto py-8 sm:py-12 px-3 sm:px-0 w-full overflow-hidden">
      {/* Background glass glows */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-amber-300/30 rounded-full blur-2xl pointer-events-none -z-10" />
      <div className="absolute -bottom-10 -right-10 w-52 h-52 bg-purple-300/30 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="text-center space-y-3 mb-6 sm:mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/25 mx-auto">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-[11px] font-semibold tracking-wide uppercase">
            <Sparkles className="w-3 h-3 text-amber-700" />
            Milestone Verification Protocol
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#231A12] mt-2 tracking-tight">Create PACTFLOW Account</h1>
          <p className="text-xs text-[#7A6C5B] font-medium mt-1">
            Where Work Meets Trust • Register to coordinate agreements and milestones
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <NotificationBanner
            type="error"
            title="Registration Error"
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}

      {success && (
        <div className="mb-4">
          <NotificationBanner
            type="success"
            title="Account Ready"
            message={success}
          />
        </div>
      )}

      <form onSubmit={handleRegister} className="glass-card p-6 sm:p-8 rounded-3xl border border-white/90 shadow-glass space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#4B3F33]">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-[#8C7D6C] absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name (e.g. Alex Rivera)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#4B3F33]">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#8C7D6C] absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@pactflow.io"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#4B3F33]">I am joining as:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all min-h-[44px] ${
                role === 'client'
                  ? 'bg-purple-50/90 border-purple-400/80 text-purple-900 ring-2 ring-purple-500/20'
                  : 'bg-white/60 border-[#DFD4C3] text-[#6A5D4E]'
              }`}
            >
              Client (Hiring)
            </button>
            <button
              type="button"
              onClick={() => setRole('freelancer')}
              className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all min-h-[44px] ${
                role === 'freelancer'
                  ? 'bg-amber-50/90 border-amber-400/80 text-amber-900 ring-2 ring-amber-500/20'
                  : 'bg-white/60 border-[#DFD4C3] text-[#6A5D4E]'
              }`}
            >
              Freelancer (Executing)
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 group min-h-[44px]"
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="pt-2 border-t border-[#EAE1D2] flex items-center justify-between text-xs text-[#7A6C5B]">
          <span>Already have an account?</span>
          <Link href="/login" className="font-bold text-purple-700 hover:text-purple-900 transition-colors">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
