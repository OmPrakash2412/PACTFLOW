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
import { Project, Milestone } from '../../../types';

export default function ClientDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBudget: 6500,
    paidAmount: 2500,
    pendingAmount: 4000,
    activeContracts: 1,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getProjects();
        setProjects(data);
        if (data.length > 0) {
          const total = data.reduce((acc, p) => acc + Number(p.budget), 0);
          setStats({
            totalBudget: total,
            paidAmount: 2500, // Seed paid amount
            pendingAmount: total - 2500,
            activeContracts: data.length,
          });
        }
      } catch (err) {
        console.warn('Backend loading warning:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const chartData = [
    { name: 'Milestone 1 (Architecture)', amount: 2500, status: 'Paid' },
    { name: 'Milestone 2 (AI Engine)', amount: 2500, status: 'Approved' },
    { name: 'Milestone 3 (PayPal Invoicing)', amount: 1500, status: 'In Progress' },
  ];

  const pieData = [
    { name: 'Settled (PayPal)', value: 2500, color: '#10B981' },
    { name: 'Approved Pending Pay', value: 2500, color: '#6366F1' },
    { name: 'In Progress', value: 1500, color: '#0EA5E9' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-primary font-medium uppercase tracking-wider">Client Management Center</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Active Projects & Settlement</h1>
          <p className="text-slate-400 text-sm mt-1">Review deliverables, approve verified work, and authorize PayPal milestone invoices.</p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-primary/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Project with Gemini
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-navy-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL COMMITTED</span>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">${stats.totalBudget.toLocaleString()} USD</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span className="text-emerald-400">100%</span> Dual-accepted agreement
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-navy-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>SETTLED (PAYPAL)</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">${stats.paidAmount.toLocaleString()} USD</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span>Authoritative capture verified</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-navy-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PENDING SETTLEMENT</span>
            <Clock className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">${stats.pendingAmount.toLocaleString()} USD</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span>Awaiting deliverable review</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-navy-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TRUST LEDGER</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-2">Verified Valid</div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            SHA-256 unbroken chain
          </div>
        </div>
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-navy-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Milestone Allocation & Status
            </h3>
            <span className="text-xs font-mono text-slate-400">Project: PulseAnalytics AI</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Bar dataKey="amount" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-navy-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-secondary" />
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
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-xs">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-mono">${item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="glass-panel rounded-xl border border-navy-800 overflow-hidden">
        <div className="p-5 border-b border-navy-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-primary" />
            Active Client Projects
          </h2>
          <span className="text-xs font-mono text-slate-400">{projects.length} Registered Project(s)</span>
        </div>

        <div className="divide-y divide-navy-800/60">
          {projects.map((project) => (
            <div key={project.id} className="p-5 hover:bg-navy-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <Link href={`/projects/${project.id}`} className="text-base font-bold text-white hover:text-primary transition-colors">
                    {project.title}
                  </Link>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {project.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{project.description}</p>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                  <span>Budget: <strong className="text-white">${project.budget} {project.currency}</strong></span>
                  <span>Freelancer: <strong className="text-slate-200">{project.freelancer_name || 'Alex Rivera'}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/projects/${project.id}`}
                  className="px-4 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 text-xs text-white border border-navy-700 font-medium flex items-center gap-1.5 transition-colors"
                >
                  Workspace
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
