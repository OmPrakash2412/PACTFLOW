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
  Sparkles
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
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-[#E8DFD3]/80 bg-[#FAF7F2]/80 backdrop-blur-xl">
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

          {/* Desktop Nav */}
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
                      ? 'bg-white/90 text-purple-700 shadow-sm border border-purple-200/70'
                      : 'text-[#5E5142] hover:text-[#1F1914] hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Role switcher & Auth controls */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center bg-white/80 border border-[#E2D7C7] rounded-xl p-0.5 text-xs font-medium shadow-sm">
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-rose-50 text-[#6B5A49] hover:text-rose-700 border border-[#DFD4C3] hover:border-rose-200 text-xs font-medium shadow-sm transition-all"
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

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#5E5142] hover:text-[#1F1914] hover:bg-white/80 border border-[#E2D7C7]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8DFD3] bg-[#FAF7F2]/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-white text-purple-700 border border-purple-200 shadow-sm'
                    : 'text-[#5E5142] hover:text-[#1F1914] hover:bg-white/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-[#E8DFD3] flex items-center justify-between">
            <span className="text-xs text-[#7A6C5B] font-medium">Role Mode:</span>
            <div className="flex gap-2">
              <button
                onClick={() => { switchRole('client'); setMobileMenuOpen(false); }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${activeRole === 'client' ? 'bg-purple-600 text-white' : 'text-[#6A5D4E] bg-white border border-[#DFD4C3]'}`}
              >
                Client
              </button>
              <button
                onClick={() => { switchRole('freelancer'); setMobileMenuOpen(false); }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${activeRole === 'freelancer' ? 'bg-amber-600 text-white' : 'text-[#6A5D4E] bg-white border border-[#DFD4C3]'}`}
              >
                Freelancer
              </button>
            </div>
          </div>
          {isLoggedIn ? (
            <button
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold mt-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold mt-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
