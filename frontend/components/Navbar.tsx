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
  FolderPlus,
  Palette
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
    { href: '/design', label: 'Design System', icon: Palette },
    { href: '/settings', label: 'Settings', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-[#E8DFD3]/80 bg-[#FAF7F2]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-stone-900 flex items-center gap-1">
                  PACT<span className="text-amber-700 font-extrabold">FLOW</span>
                </span>
                <span className="hidden sm:block text-[9px] text-stone-500 font-mono tracking-wider uppercase font-semibold">
                  Where Work Meets Trust
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Role switcher, Sandbox badge & Auth controls */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center bg-stone-100 border border-stone-300/80 rounded-xl p-0.5 text-xs font-medium shadow-sm">
              <button
                onClick={() => switchRole('client')}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-semibold ${
                  activeRole === 'client'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Client
              </button>
              <button
                onClick={() => switchRole('freelancer')}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-semibold ${
                  activeRole === 'freelancer'
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Freelancer
              </button>
            </div>

            {/* Sandbox mode pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              PayPal Sandbox
            </div>

            {/* Auth Link / Button */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-stone-500 hover:text-rose-700 hover:bg-rose-50/80 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger Button (Accessible 44px touch target) */}
          <div className="flex sm:hidden items-center gap-2">
            <div className="flex items-center bg-stone-100 border border-stone-300 rounded-lg p-0.5 text-[11px] font-semibold">
              <button
                onClick={() => switchRole('client')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  activeRole === 'client' ? 'bg-stone-900 text-white' : 'text-stone-600'
                }`}
              >
                Client
              </button>
              <button
                onClick={() => switchRole('freelancer')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  activeRole === 'freelancer' ? 'bg-amber-700 text-white' : 'text-stone-600'
                }`}
              >
                Freelancer
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-stone-100/90 text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 border border-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 top-16 z-40 bg-stone-900/30 backdrop-blur-sm sm:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-full max-h-[calc(100vh-4rem)] overflow-y-auto bg-[#FAF7F2] border-b border-stone-300 shadow-2xl p-5 space-y-5 animate-in slide-in-from-top-2 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Role Switcher */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500">Current Workspace Role</span>
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl border border-stone-300/80">
                <button
                  onClick={() => {
                    switchRole('client');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all min-h-[44px] flex items-center justify-center ${
                    activeRole === 'client'
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-700 hover:bg-stone-200/50'
                  }`}
                >
                  Client Portal
                </button>
                <button
                  onClick={() => {
                    switchRole('freelancer');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all min-h-[44px] flex items-center justify-center ${
                    activeRole === 'freelancer'
                      ? 'bg-amber-700 text-white shadow-sm'
                      : 'text-stone-700 hover:bg-stone-200/50'
                  }`}
                >
                  Freelancer Hub
                </button>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1 pt-2 border-t border-stone-200">
              <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-2">Navigation</span>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'text-stone-700 hover:bg-stone-200/60 active:bg-stone-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Direct Contact Links */}
            <div className="pt-3 border-t border-stone-200 space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Direct Support</span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="mailto:support@pactflow.io"
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-100 min-h-[44px]"
                >
                  <Mail className="w-3.5 h-3.5 text-stone-600" />
                  <span>Email Support</span>
                </a>
                <a
                  href="tel:+18005557228"
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-100 min-h-[44px]"
                >
                  <Phone className="w-3.5 h-3.5 text-stone-600" />
                  <span>Call Toll-Free</span>
                </a>
              </div>
            </div>

            {/* Auth Action */}
            <div className="pt-3 border-t border-stone-200">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of PACTFLOW</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-900 text-white text-xs font-bold min-h-[44px]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
