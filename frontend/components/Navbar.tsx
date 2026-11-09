'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  FileText, 
  Layers, 
  User, 
  Menu, 
  X, 
  LogOut, 
  LogIn,
  Sparkles,
  Mail,
  Phone,
  FolderPlus
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<'client' | 'freelancer'>('client');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('pactflow_token');
    setIsLoggedIn(!!token);
    const savedRole = localStorage.getItem('pactflow_role');
    if (savedRole === 'freelancer' || savedRole === 'client') {
      setActiveRole(savedRole);
    }
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const switchRole = (role: 'client' | 'freelancer') => {
    setActiveRole(role);
    localStorage.setItem('pactflow_role', role);
    if (role === 'client') {
      router.push('/dashboard');
    } else {
      router.push('/freelancer');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pactflow_token');
    localStorage.removeItem('pactflow_role');
    setIsLoggedIn(false);
    router.push('/login');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Client Hub', icon: Layers },
    { href: '/freelancer', label: 'Freelancer Hub', icon: FileText },
    { href: '/ledger', label: 'Trust Ledger', icon: ShieldCheck },
    { href: '/settings', label: 'Settings', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-[#E8DFD3]/80 bg-[#FAF7F2]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-[#231A12] flex items-center gap-1.5">
                  PACT<span className="text-purple-700 font-extrabold">FLOW</span>
                </span>
                <span className="hidden sm:block text-[9.5px] text-[#7A6C5B] font-mono tracking-wider uppercase font-semibold">
                  Where Work Meets Trust
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white/95 text-purple-700 shadow-sm border border-purple-200/80 font-bold'
                      : 'text-[#5E5142] hover:text-[#1F1914] hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Role switcher, Sandbox badge & Auth controls */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center bg-white/85 border border-[#E2D7C7] rounded-xl p-0.5 text-xs font-medium shadow-sm">
              <button
                onClick={() => switchRole('client')}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-semibold ${
                  activeRole === 'client'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-[#6A5D4E] hover:text-[#231A12]'
                }`}
              >
                Client
              </button>
              <button
                onClick={() => switchRole('freelancer')}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-semibold ${
                  activeRole === 'freelancer'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-[#6A5D4E] hover:text-[#231A12]'
                }`}
              >
                Freelancer
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-xs font-mono font-medium shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              PayPal Sandbox
            </div>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/85 hover:bg-rose-50 text-[#6B5A49] hover:text-rose-700 border border-[#DFD4C3] hover:border-rose-200 text-xs font-semibold shadow-sm transition-all"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="p-2.5 rounded-xl text-[#5E5142] hover:text-[#1F1914] bg-white/80 border border-[#E2D7C7] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-[#FAF7F2]/98 backdrop-blur-2xl border-t border-[#E8DFD3] flex flex-col justify-between p-5 overflow-y-auto animate-fadeIn">
          <div className="space-y-4">
            {/* Role switch in mobile drawer */}
            <div className="p-3.5 rounded-2xl bg-white/80 border border-[#EAE1D2] space-y-2">
              <span className="text-[11px] font-mono uppercase font-bold text-[#7A6C5B]">Active Role Mode</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { switchRole('client'); setMobileMenuOpen(false); }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                    activeRole === 'client'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white border border-[#DFD4C3] text-[#6A5D4E]'
                  }`}
                >
                  Client Hub
                </button>
                <button
                  onClick={() => { switchRole('freelancer'); setMobileMenuOpen(false); }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                    activeRole === 'freelancer'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white border border-[#DFD4C3] text-[#6A5D4E]'
                  }`}
                >
                  Freelancer Hub
                </button>
              </div>
            </div>

            {/* Navigation links */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase font-bold text-[#7A6C5B] px-1">Navigation</span>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-white text-purple-700 border border-purple-200 shadow-sm'
                        : 'text-[#5E5142] hover:text-[#1F1914] hover:bg-white/60'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-purple-700" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <Link
                href="/projects/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[#5E5142] hover:text-[#1F1914] hover:bg-white/60 min-h-[44px]"
              >
                <FolderPlus className="w-5 h-5 text-amber-700" />
                <span>Create New Project</span>
              </Link>
            </div>
          </div>

          {/* Bottom Mobile Drawer Section: Auth & Clickable Support */}
          <div className="pt-4 border-t border-[#EAE1D2] space-y-3">
            {/* Clickable Email & Phone in Mobile Drawer */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <a
                href="mailto:support@pactflow.io"
                className="p-2.5 rounded-xl bg-white/80 border border-[#DFD4C3] text-purple-700 hover:text-purple-900 flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Support</span>
              </a>
              <a
                href="tel:+18005557228"
                className="p-2.5 rounded-xl bg-white/80 border border-[#DFD4C3] text-amber-800 hover:text-amber-950 flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Us</span>
              </a>
            </div>

            {isLoggedIn ? (
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold transition-colors min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of PACTFLOW</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-600/20 min-h-[44px]"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to PACTFLOW</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
