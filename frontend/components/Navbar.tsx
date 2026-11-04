'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, FileText, Layers, CheckCircle, CreditCard, User, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<'client' | 'freelancer'>('client');

  useEffect(() => {
    const savedRole = localStorage.getItem('pactflow_role');
    if (savedRole === 'freelancer' || savedRole === 'client') {
      setActiveRole(savedRole);
    }
  }, []);

  const switchRole = (role: 'client' | 'freelancer') => {
    setActiveRole(role);
    localStorage.setItem('pactflow_role', role);
    if (role === 'client') {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/freelancer';
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Client Hub', icon: Layers },
    { href: '/freelancer', label: 'Freelancer Hub', icon: FileText },
    { href: '/ledger', label: 'Trust Ledger', icon: ShieldCheck },
    { href: '/settings', label: 'Settings', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-navy-800/80 bg-navy-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  PACT<span className="text-primary font-extrabold">FLOW</span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                  Where Work Meets Trust
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-navy-850 text-primary border border-primary/20 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-navy-850/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Role switcher & Sandbox pill */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center bg-navy-900 border border-navy-700/80 rounded-lg p-0.5 text-xs font-medium">
              <button
                onClick={() => switchRole('client')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeRole === 'client'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Client View
              </button>
              <button
                onClick={() => switchRole('freelancer')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeRole === 'freelancer'
                    ? 'bg-secondary text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Freelancer View
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              PayPal Sandbox Ready
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-850"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-navy-800 bg-navy-950 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-navy-850 text-primary border border-primary/20'
                    : 'text-slate-300 hover:text-white hover:bg-navy-850/60'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-navy-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Switch View Mode:</span>
            <div className="flex gap-2">
              <button
                onClick={() => { switchRole('client'); setMobileMenuOpen(false); }}
                className={`px-3 py-1 rounded text-xs ${activeRole === 'client' ? 'bg-primary text-white' : 'text-slate-400 bg-navy-900'}`}
              >
                Client
              </button>
              <button
                onClick={() => { switchRole('freelancer'); setMobileMenuOpen(false); }}
                className={`px-3 py-1 rounded text-xs ${activeRole === 'freelancer' ? 'bg-secondary text-white' : 'text-slate-400 bg-navy-900'}`}
              >
                Freelancer
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
