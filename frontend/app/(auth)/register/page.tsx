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
      setSuccess('Account created successfully! Launching your workspace...');
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
      <div className="text-center space-y-3 mb-6 sm:mb-8">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center shadow-sm mx-auto">
          <ShieldCheck className="w-7 sm:w-8 h-7 sm:h-8 text-amber-500" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-300/80 text-stone-800 text-[11px] font-medium uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-700" />
            Milestone Verification Protocol
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#231A12] mt-2 tracking-tight">Create PACTFLOW Account</h1>
          <p className="text-xs text-[#7A6C5B] font-normal mt-1">
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

      <form onSubmit={handleRegister} className="glass-card p-6 sm:p-8 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#4B3F33]">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-[#8C7D6C] absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
              placeholder="Elena Vance"
            />
          </div>
        </div>

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
              placeholder="elena@company.com"
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
              placeholder="••••••••••••"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#4B3F33]">Primary Account Role</label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`p-3 rounded-xl border text-left transition-all min-h-[44px] ${
                role === 'client'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                  : 'bg-white/80 border-[#DFD4C3] text-stone-800 hover:bg-stone-50'
              }`}
            >
              <div className="text-xs font-bold">Client / Hirer</div>
              <p className={`text-[10px] mt-0.5 ${role === 'client' ? 'text-stone-300' : 'text-[#7A6C5B]'}`}>Create contracts & pay</p>
            </button>

            <button
              type="button"
              onClick={() => setRole('freelancer')}
              className={`p-3 rounded-xl border text-left transition-all min-h-[44px] ${
                role === 'freelancer'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                  : 'bg-white/80 border-[#DFD4C3] text-stone-800 hover:bg-stone-50'
              }`}
            >
              <div className="text-xs font-bold">Freelancer / Builder</div>
              <p className={`text-[10px] mt-0.5 ${role === 'freelancer' ? 'text-stone-300' : 'text-[#7A6C5B]'}`}>Deliver work & receive</p>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 group min-h-[44px]"
        >
          {loading ? (
            <span>Creating Workspace...</span>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        <div className="pt-2 border-t border-[#EAE1D2] flex items-center justify-between text-xs text-[#7A6C5B]">
          <span>Already registered?</span>
          <Link href="/login" className="font-semibold text-stone-900 hover:text-amber-800 transition-colors">
            Sign In Here
          </Link>
        </div>
      </form>
    </div>
  );
}
