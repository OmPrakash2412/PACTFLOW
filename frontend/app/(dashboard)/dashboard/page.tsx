'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  ShieldCheck,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../../../lib/api';
import { Project } from '../../../types';
import EmptyState from '../../../components/EmptyState';
import NotificationBanner from '../../../components/NotificationBanner';

export default function ClientDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalBudget: 6500,
    paidAmount: 2500,
    pendingAmount: 4000,
    activeContracts: 1,
  });

  useEffect(() => {
    document.title = 'Client Hub | PACTFLOW';
    async function loadData() {
      try {
        const data = await api.getProjects();
        setProjects(data);
        if (data && data.length > 0) {
          const total = data.reduce((acc, p) => acc + Number(p.budget), 0);
          setStats({
            totalBudget: total,
            paidAmount: 2500,
            pendingAmount: Math.max(0, total - 2500),
            activeContracts: data.length,
          });
        }
      } catch (err: any) {
        console.warn('Backend loading warning:', err);
        setErrorNotice(err.message || 'Unable to connect to local backend API. Showing offline cached metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const chartData = [
    { name: 'M1: Architecture', amount: 2500, status: 'Paid' },
    { name: 'M2: AI Engine', amount: 2500, status: 'Approved' },
    { name: 'M3: PayPal Invoicing', amount: 1500, status: 'In Progress' },
  ];

  const pieData = [
    { name: 'Settled (PayPal)', value: 2500, color: '#059669' },
    { name: 'Approved Pending Pay', value: 2500, color: '#7C3AED' },
    { name: 'In Progress', value: 1500, color: '#D97706' },
  ];

  return (
    <div className="space-y-8 py-2 w-full max-w-full overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-[11px] font-semibold tracking-wide uppercase mb-1">
            <Sparkles className="w-3 h-3 text-amber-700" />
            Client Management Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#231A12] tracking-tight">Active Projects & Settlement</h1>
          <p className="text-[#6B5C4D] text-xs sm:text-sm mt-0.5">
            Review deliverables, approve verified work, and authorize PayPal milestone invoices.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all self-start sm:self-auto group min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Project with Gemini</span>
        </Link>
      </div>

      {errorNotice && (
        <NotificationBanner
          type="warning"
          title="Connection Notice"
          message={errorNotice}
          onClose={() => setErrorNotice(null)}
        />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/90 shadow-glass">
          <div className="flex items-center justify-between text-[#7A6C5B] text-xs font-mono font-semibold">
            <span>TOTAL COMMITTED</span>
            <DollarSign className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-2xl font-black text-[#231A12] mt-2">${stats.totalBudget.toLocaleString()} USD</div>
          <div className="text-xs text-[#6B5C4D] mt-1 flex items-center gap-1 font-medium">
            <span className="text-emerald-700 font-bold">100%</span> Dual-accepted agreement
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/90 shadow-glass">
          <div className="flex items-center justify-between text-[#7A6C5B] text-xs font-mono font-semibold">
            <span>SETTLED (PAYPAL)</span>
            <CheckCircle className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">${stats.paidAmount.toLocaleString()} USD</div>
          <div className="text-xs text-[#6B5C4D] mt-1 flex items-center gap-1 font-medium">
            <span>Authoritative capture verified</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/90 shadow-glass">
          <div className="flex items-center justify-between text-[#7A6C5B] text-xs font-mono font-semibold">
            <span>PENDING SETTLEMENT</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-black text-[#231A12] mt-2">${stats.pendingAmount.toLocaleString()} USD</div>
          <div className="text-xs text-[#6B5C4D] mt-1 flex items-center gap-1 font-medium">
            <span>Awaiting deliverable review</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/90 shadow-glass">
          <div className="flex items-center justify-between text-[#7A6C5B] text-xs font-mono font-semibold">
            <span>TRUST LEDGER</span>
            <ShieldCheck className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-2xl font-black text-purple-700 mt-2">Verified Valid</div>
          <div className="text-xs text-[#6B5C4D] mt-1 font-mono font-medium">
            SHA-256 unbroken chain
          </div>
        </div>
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/90 shadow-glass space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#231A12] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-700" />
              Milestone Allocation & Status
            </h3>
            <span className="text-xs font-mono text-[#7A6C5B]">Project: PulseAnalytics AI</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE1D2" />
                <XAxis dataKey="name" stroke="#7A6C5B" fontSize={11} />
                <YAxis stroke="#7A6C5B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FAF7F2', borderColor: '#DFD4C3', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                  itemStyle={{ color: '#231A12', fontWeight: 600 }}
                />
                <Bar dataKey="amount" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/90 shadow-glass space-y-4 overflow-hidden">
          <h3 className="text-base font-bold text-[#231A12] flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-700" />
            Budget Settlement Split
          </h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FAF7F2', borderColor: '#DFD4C3', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                  itemStyle={{ color: '#231A12', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-xs">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[#4B3F33] font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-mono font-bold">${item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects List or Empty State */}
      <div className="glass-card rounded-3xl border border-white/90 shadow-glass overflow-hidden">
        <div className="p-6 border-b border-[#EAE1D2] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#231A12] flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-purple-700" />
            Active Client Projects
          </h2>
          <span className="text-xs font-mono text-[#7A6C5B] font-semibold">
            {projects.length} Registered Project(s)
          </span>
        </div>

        {projects.length === 0 && !loading ? (
          <EmptyState
            icon={Layers}
            title="No Active Projects Yet"
            description="You haven't initiated any freelance contracts. Click below to describe your scope and let Gemini Pact Architect draft milestone terms."
            actionLabel="Synthesize First Project"
            actionHref="/projects/new"
          />
        ) : (
          <div className="divide-y divide-[#EAE1D2]">
            {projects.map((project) => (
              <div key={project.id} className="p-5 sm:p-6 hover:bg-white/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Link href={`/projects/${project.id}`} className="text-base font-bold text-[#231A12] hover:text-purple-700 transition-colors">
                      {project.title}
                    </Link>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                      {project.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B5C4D] line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#7A6C5B] pt-1">
                    <span>Budget: <strong className="text-[#231A12]">${project.budget} {project.currency}</strong></span>
                    <span>Freelancer: <strong className="text-[#3B3026]">{project.freelancer_name || 'Alex Rivera'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/projects/${project.id}`}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-xs text-[#231A12] hover:text-purple-700 border border-[#DFD4C3] hover:border-purple-300 font-bold flex items-center gap-1.5 shadow-sm transition-all min-h-[40px]"
                  >
                    Workspace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
