'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  FileText,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Upload,
  AlertCircle,
  CreditCard,
  Hash,
  ChevronRight,
  ArrowLeft,
  Check,
  RefreshCw,
  Send,
  FileCheck
} from 'lucide-react';
import { api } from '../../../lib/api';
import {
  Project,
  Agreement,
  Milestone,
  Deliverable,
  VerificationReport,
  TrustEvent,
  TrustStatus,
  PaymentCoordination
} from '../../../types';

export default function ProjectWorkspace() {
  const params = useParams();
  const projectId = params?.id as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'agreement' | 'milestones' | 'invoices' | 'ledger'>('overview');
  const [project, setProject] = useState<Project | null>(null);
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [trustEvents, setTrustEvents] = useState<TrustEvent[]>([]);
  const [trustStatus, setTrustStatus] = useState<TrustStatus | null>(null);
  const [coordination, setCoordination] = useState<PaymentCoordination | null>(null);

  // Deliverable submission state
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [deliverableDesc, setDeliverableDesc] = useState('');
  const [deliverableFiles, setDeliverableFiles] = useState('');
  const [deliverableDemo, setDeliverableDemo] = useState('');
  const [deliverableNotes, setDeliverableNotes] = useState('');
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);

  // Active verification report
  const [activeReport, setActiveReport] = useState<VerificationReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // PayPal Invoice state
  const [invoicingLoading, setInvoicingLoading] = useState(false);
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const loadAllData = async () => {
    if (!projectId) return;
    try {
      const projData = await api.getProject(projectId);
      setProject(projData);

      const agList = await api.getAgreements(projectId);
      if (agList && agList.length > 0) {
        setAgreement(agList[0]);
      }

      const msList = await api.getMilestones(projectId);
      setMilestones(msList);

      const events = await api.getTrustEvents(projectId);
      setTrustEvents(events);

      const tStatus = await api.verifyTrustLedger(projectId);
      setTrustStatus(tStatus);

      try {
        const coord = await api.getPaymentCoordination(projectId);
        setCoordination(coord);
      } catch (_) {}
    } catch (err) {
      console.warn('Error loading workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [projectId]);

  const handleAcceptAgreement = async () => {
    if (!agreement) return;
    try {
      await api.acceptAgreement(agreement.id);
      setNotification('Agreement digitally accepted! Sealed into Trust Ledger.');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Error signing agreement');
    }
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    setSubmittingDeliverable(true);
    try {
      const filesArray = deliverableFiles
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await api.submitDeliverable({
        milestone_id: selectedMilestone.id,
        title: deliverableTitle,
        description: deliverableDesc,
        file_urls: filesArray.length > 0 ? filesArray : undefined,
        demo_url: deliverableDemo || undefined,
        notes: deliverableNotes || undefined,
      });

      setSelectedMilestone(null);
      setNotification('Deliverable submitted! Gemini Evidence Inspector audit completed.');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Error submitting deliverable');
    } finally {
      setSubmittingDeliverable(false);
    }
  };

  const handleClientDecision = async (milestoneId: string, action: 'approve' | 'request_revisions') => {
    try {
      await api.clientDecision(milestoneId, action, action === 'approve' ? 'All criteria satisfied.' : 'Please fix identified items.');
      setNotification(action === 'approve' ? 'Milestone approved! Ready for PayPal Invoice.' : 'Revisions requested.');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Error updating milestone');
    }
  };

  const handleGenerateInvoice = async (milestoneId: string) => {
    setInvoicingLoading(true);
    try {
      const inv = await api.generateInvoice(milestoneId);
      setNotification(`PayPal invoice ${inv.paypal_invoice_id || inv.id} created & sent!`);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Error generating invoice');
    } finally {
      setInvoicingLoading(false);
    }
  };

  const handleViewReport = async (milestone: Milestone) => {
    setReportLoading(true);
    try {
      const deliv = await api.getDeliverable(milestone.id);
      if (deliv && deliv.id) {
        const rep = await api.getVerificationReport(deliv.id);
        setActiveReport(rep);
      } else {
        alert('No deliverable has been submitted for this milestone yet.');
      }
    } catch (err: any) {
      alert('Could not load report: ' + err.message);
    } finally {
      setReportLoading(false);
    }
  };

  const simulatePayPalPayment = async (invoiceId: string) => {
    setReconcilingId(invoiceId);
    try {
      const invoice = await api.getInvoice(invoiceId);
      const webhookPayload = {
        id: `WH-SIM-${Date.now()}`,
        event_type: 'INVOICING.INVOICE.PAID',
        summary: 'Paid in PayPal Developer Sandbox',
        resource: {
          id: invoice.paypal_invoice_id || invoice.id,
          status: 'PAID',
          capture_id: `CAP-SB-${Date.now().toString().slice(-8)}`,
          amount: { currency_code: invoice.currency, value: invoice.amount.toString() }
        }
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/webhooks/paypal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      });

      if (res.ok) {
        setNotification('PayPal Sandbox payment confirmed via authoritative webhook!');
        await loadAllData();
      }
    } catch (err: any) {
      alert('Simulation error: ' + err.message);
    } finally {
      setReconcilingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-[#7A6C5B] font-mono text-xs">Loading PACTFLOW Project Workspace...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#231A12]">Project Not Found</h2>
        <Link href="/dashboard" className="text-purple-700 hover:underline text-sm font-mono font-bold">
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2">
      {/* Breadcrumb & Notifications */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE1D2] pb-5">
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#7A6C5B] hover:text-[#231A12] font-mono font-bold transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#231A12] tracking-tight">{project.title}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
              {project.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-[#7A6C5B] font-mono">
            ID: {project.id} | Budget: <strong className="text-[#231A12]">${project.budget} {project.currency}</strong>
          </p>
        </div>

        {trustStatus && (
          <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 border border-[#EAE1D2] text-xs font-mono shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="text-[#6B5C4D]">Trust Ledger:</span>
            <span className="text-emerald-700 font-bold">{trustStatus.total_events} Block(s) Verified</span>
          </div>
        )}
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            {notification}
          </span>
          <button onClick={() => setNotification(null)} className="text-xs text-emerald-700 hover:underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Workspace Tabs */}
      <div className="flex border-b border-[#EAE1D2] space-x-1 sm:space-x-3 overflow-x-auto text-sm font-semibold">
        {[
          { key: 'overview', label: 'Overview & AI Coordinator', icon: Layers },
          { key: 'agreement', label: 'Agreement & Gemini Contract', icon: FileText },
          { key: 'milestones', label: `Milestones (${milestones.length})`, icon: CheckCircle2 },
          { key: 'invoices', label: 'PayPal Settlement & Invoices', icon: CreditCard },
          { key: 'ledger', label: `Trust Ledger (${trustEvents.length})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-purple-600 text-purple-700 bg-white/70 rounded-t-xl'
                  : 'border-transparent text-[#7A6C5B] hover:text-[#231A12] hover:bg-white/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & AI PAYMENT COORDINATOR */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {coordination && (
            <div className="glass-card p-6 rounded-3xl border border-white/90 shadow-glass space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-700 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                  Gemini Payment Coordinator Realtime Analysis
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                  HEALTH: {coordination.overall_health.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/70 border border-[#EAE1D2]">
                  <span className="text-xs text-[#7A6C5B] font-mono font-bold">TOTAL BUDGET</span>
                  <div className="text-lg font-black text-[#231A12] mt-1">{coordination.total_budget}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/70 border border-[#EAE1D2]">
                  <span className="text-xs text-[#7A6C5B] font-mono font-bold">SETTLED INVOICES</span>
                  <div className="text-lg font-black text-emerald-700 mt-1">{coordination.paid_amount}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/70 border border-[#EAE1D2]">
                  <span className="text-xs text-[#7A6C5B] font-mono font-bold">PENDING SETTLEMENT</span>
                  <div className="text-lg font-black text-[#231A12] mt-1">{coordination.pending_amount}</div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono text-[#7A6C5B] uppercase font-bold">Coordinator Action Items:</span>
                <ul className="space-y-1.5">
                  {coordination.action_items.map((action, idx) => (
                    <li key={idx} className="text-xs text-[#4B3F33] flex items-center gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/70 border border-[#EAE1D2] text-xs font-mono text-[#6B5C4D]">
                Risk Assessment: <span className="text-[#231A12] font-semibold">{coordination.risk_assessment}</span>
              </div>
            </div>
          )}

          <div className="glass-card p-6 rounded-3xl border border-white/90 shadow-glass space-y-4">
            <h2 className="text-lg font-bold text-[#231A12]">Project Scope & Technical Description</h2>
            <p className="text-sm text-[#4B3F33] leading-relaxed whitespace-pre-line font-medium">{project.description}</p>
            <div className="pt-4 border-t border-[#EAE1D2] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-[#7A6C5B]">
              <div>Client: <strong className="text-[#231A12]">{project.client_name || 'Sophia Vance'}</strong></div>
              <div>Assigned Freelancer: <strong className="text-[#231A12]">{project.freelancer_name || 'Alex Rivera'}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AGREEMENT & GEMINI ARCHITECT */}
      {activeTab === 'agreement' && (
        <div className="space-y-6">
          {agreement ? (
            <div className="glass-card p-8 rounded-3xl border border-white/90 shadow-glass space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE1D2] pb-5">
                <div>
                  <span className="text-xs font-mono text-purple-700 font-bold uppercase tracking-wider">Version {agreement.version}</span>
                  <h2 className="text-2xl font-black text-[#231A12] mt-1">{agreement.title}</h2>
                  <p className="text-xs text-[#7A6C5B] font-mono mt-1">Status: {agreement.status.toUpperCase()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold ${agreement.is_client_accepted ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-[#DFD4C3] text-[#7A6C5B]'}`}>
                    Client: {agreement.is_client_accepted ? 'Accepted ✓' : 'Pending'}
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold ${agreement.is_freelancer_accepted ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-[#DFD4C3] text-[#7A6C5B]'}`}>
                    Freelancer: {agreement.is_freelancer_accepted ? 'Accepted ✓' : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Scope */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-[#231A12]">1. Scope of Work</h3>
                <p className="text-sm text-[#4B3F33] leading-relaxed bg-white/70 p-4 rounded-2xl border border-[#EAE1D2] font-medium">
                  {agreement.scope_of_work}
                </p>
              </div>

              {/* Budget Allocation Table */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#231A12]">2. Budget Allocation & Milestones</h3>
                <div className="overflow-x-auto rounded-2xl border border-[#EAE1D2]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/80 text-[#7A6C5B] font-mono uppercase font-bold">
                      <tr>
                        <th className="py-2.5 px-4">Milestone</th>
                        <th className="py-2.5 px-4">Allocation ($)</th>
                        <th className="py-2.5 px-4">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE1D2] bg-white/50 text-[#4B3F33] font-medium">
                      {agreement.budget_allocation.map((b, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-4 font-bold text-[#231A12]">{b.milestone}</td>
                          <td className="py-2.5 px-4 font-mono">${b.amount} USD</td>
                          <td className="py-2.5 px-4 font-mono text-purple-700 font-bold">{b.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Acceptance Criteria */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#231A12]">3. Acceptance Criteria</h3>
                <ul className="space-y-2">
                  {agreement.acceptance_criteria.map((c, idx) => (
                    <li key={idx} className="text-xs text-[#4B3F33] flex items-start gap-2.5 bg-white/70 p-3 rounded-2xl border border-[#EAE1D2] font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Assumptions & Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#231A12]">Assumptions</h4>
                  <ul className="space-y-1 text-xs text-[#6B5C4D] list-disc list-inside">
                    {agreement.assumptions.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#231A12]">Clarification Questions</h4>
                  <ul className="space-y-1 text-xs text-[#6B5C4D] list-disc list-inside">
                    {agreement.clarification_questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Accept Button Action */}
              <div className="pt-6 border-t border-[#EAE1D2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-[#7A6C5B] font-mono">
                  Seals digital SHA-256 event into Trust Ledger upon acceptance.
                </div>
                <button
                  onClick={handleAcceptAgreement}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Digitally Sign & Accept Agreement
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-white/90 shadow-glass text-center space-y-4">
              <Sparkles className="w-8 h-8 text-purple-700 mx-auto" />
              <h3 className="text-lg font-bold text-[#231A12]">No Agreement Synthesized Yet</h3>
              <p className="text-xs text-[#6B5C4D] max-w-md mx-auto">
                Gemini Pact Architect can convert the project requirements into a verifiable agreement right now.
              </p>
              <button
                onClick={async () => {
                  try {
                    await api.generateAgreement(projectId);
                    await loadAllData();
                  } catch (e: any) {
                    alert(e.message);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
              >
                Draft Agreement with Gemini
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MILESTONES & EVIDENCE INSPECTION */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#231A12]">Milestones & Evidence Verification</h2>
            <p className="text-xs text-[#6B5C4D]">Freelancer submits deliverables. Gemini audits evidence. Client gives final approval.</p>
          </div>

          <div className="space-y-4">
            {milestones.map((m) => (
              <div key={m.id} className="glass-card p-6 rounded-3xl border border-white/90 shadow-glass space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE1D2] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center font-mono text-xs font-black text-purple-700">
                      {m.sequence_order}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-[#231A12]">{m.title}</h3>
                      <span className="text-xs font-mono text-[#7A6C5B] font-bold">${m.amount} {m.currency}</span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-bold self-start sm:self-auto ${
                    m.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    m.status === 'approved' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                    m.status === 'submitted' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    'bg-white text-[#7A6C5B] border border-[#DFD4C3]'
                  }`}>
                    {m.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-[#4B3F33] font-medium">{m.description}</p>

                {/* Acceptance Criteria */}
                <div className="p-4 rounded-2xl bg-white/70 border border-[#EAE1D2] space-y-2">
                  <span className="text-xs font-mono text-[#7A6C5B] uppercase font-bold">Agreed Acceptance Criteria:</span>
                  <ul className="space-y-1">
                    {m.acceptance_criteria.map((c, idx) => (
                      <li key={idx} className="text-xs text-[#4B3F33] flex items-center gap-2 font-medium">
                        <Check className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions per state */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {['pending', 'in_progress', 'changes_requested'].includes(m.status) && (
                      <button
                        onClick={() => {
                          setSelectedMilestone(m);
                          setDeliverableTitle(`Deliverables for ${m.title}`);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Submit Deliverable Evidence
                      </button>
                    )}

                    {m.has_deliverable && (
                      <button
                        onClick={() => handleViewReport(m)}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-purple-50 border border-[#DFD4C3] hover:border-purple-300 text-[#231A12] hover:text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-purple-700" />
                        Inspect AI Evidence Audit
                      </button>
                    )}
                  </div>

                  {m.status === 'submitted' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleClientDecision(m.id, 'request_revisions')}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold transition-all"
                      >
                        Request Revisions
                      </button>
                      <button
                        onClick={() => handleClientDecision(m.id, 'approve')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve Milestone
                      </button>
                    </div>
                  )}

                  {m.status === 'approved' && (
                    <button
                      disabled={invoicingLoading}
                      onClick={() => handleGenerateInvoice(m.id)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Generate PayPal Sandbox Invoice
                    </button>
                  )}

                  {m.status === 'invoiced' && m.paypal_hosted_url && (
                    <a
                      href={m.paypal_hosted_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      Pay in PayPal Sandbox <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Deliverable Submission Modal */}
          {selectedMilestone && (
            <div className="fixed inset-0 z-50 bg-[#231A12]/40 backdrop-blur-md flex items-center justify-center p-4">
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/90 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#EAE1D2] pb-3">
                  <h3 className="text-lg font-bold text-[#231A12] flex items-center gap-2">
                    <Upload className="w-5 h-5 text-amber-700" />
                    Submit Evidence for {selectedMilestone.title}
                  </h3>
                  <button onClick={() => setSelectedMilestone(null)} className="text-[#7A6C5B] hover:text-[#231A12] font-bold">✕</button>
                </div>

                <form onSubmit={handleSubmitDeliverable} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B3F33]">Deliverable Title</label>
                    <input
                      type="text"
                      required
                      value={deliverableTitle}
                      onChange={(e) => setDeliverableTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B3F33]">Description of Work</label>
                    <textarea
                      required
                      rows={3}
                      value={deliverableDesc}
                      onChange={(e) => setDeliverableDesc(e.target.value)}
                      placeholder="Detail implemented features, tests executed, and code references..."
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-medium text-[#231A12]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B3F33]">Attached Artifact URLs (one per line)</label>
                    <textarea
                      rows={2}
                      value={deliverableFiles}
                      onChange={(e) => setDeliverableFiles(e.target.value)}
                      placeholder="https://github.com/org/repo/pull/4"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono font-medium text-[#231A12]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B3F33]">Live Demo / Staging URL (Optional)</label>
                    <input
                      type="url"
                      value={deliverableDemo}
                      onChange={(e) => setDeliverableDemo(e.target.value)}
                      placeholder="https://staging.example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono font-medium text-[#231A12]"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex gap-2 font-medium">
                    <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Gemini Evidence Inspector will evaluate these artifacts against the agreed milestone criteria upon submission.</span>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMilestone(null)}
                      className="px-4 py-2 rounded-xl bg-white text-[#6B5C4D] text-xs font-bold border border-[#DFD4C3]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingDeliverable}
                      className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20"
                    >
                      {submittingDeliverable ? 'Auditing with Gemini...' : 'Submit & Run Evidence Audit'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Evidence Inspector Report Modal */}
          {activeReport && (
            <div className="fixed inset-0 z-50 bg-[#231A12]/40 backdrop-blur-md flex items-center justify-center p-4">
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/90 max-w-3xl w-full space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#EAE1D2] pb-3">
                  <div>
                    <span className="text-xs font-mono text-purple-700 font-bold uppercase tracking-wider">Gemini Evidence Audit</span>
                    <h3 className="text-xl font-black text-[#231A12] mt-0.5">Verification Report</h3>
                  </div>
                  <button onClick={() => setActiveReport(null)} className="text-[#7A6C5B] hover:text-[#231A12] font-bold">✕</button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/70 border border-[#EAE1D2]">
                  <div>
                    <div className="text-xs font-mono text-[#7A6C5B] font-bold">OVERALL VERDICT</div>
                    <div className={`text-lg font-black uppercase mt-0.5 ${
                      activeReport.overall_verdict === 'satisfied' ? 'text-emerald-700' :
                      activeReport.overall_verdict === 'uncertain' ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {activeReport.overall_verdict}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#7A6C5B] text-right font-bold">CONFIDENCE</div>
                    <div className="text-lg font-black text-[#231A12] font-mono">{activeReport.confidence_score}%</div>
                  </div>
                </div>

                <p className="text-xs text-[#4B3F33] leading-relaxed bg-white/70 p-3.5 rounded-2xl border border-[#EAE1D2] font-medium">
                  {activeReport.summary}
                </p>

                {/* Criteria breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-[#7A6C5B] uppercase font-bold">Individual Criteria Evaluations:</h4>
                  <div className="space-y-2">
                    {activeReport.criteria_analysis.map((crit, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white/70 border border-[#EAE1D2] space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#231A12]">{crit.criterion}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            crit.verdict === 'satisfied' ? 'bg-emerald-100 text-emerald-800' :
                            crit.verdict === 'uncertain' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {crit.verdict}
                          </span>
                        </div>
                        <p className="text-[#6B5C4D]">{crit.evidence_reference}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {activeReport.recommendations.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1 text-xs">
                    <span className="font-bold text-purple-900">Recommendations:</span>
                    <ul className="list-disc list-inside text-purple-900 space-y-0.5 font-medium">
                      {activeReport.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setActiveReport(null)}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PAYPAL SETTLEMENT & INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#231A12]">PayPal Sandbox Settlements</h2>
              <p className="text-xs text-[#6B5C4D]">Real Invoicing API v2 execution. Funds flow directly through PayPal's sandbox gateway.</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-mono font-bold">
              api-m.sandbox.paypal.com
            </div>
          </div>

          <div className="glass-card rounded-3xl border border-white/90 shadow-glass divide-y divide-[#EAE1D2]">
            {milestones.filter(m => ['approved', 'invoiced', 'paid'].includes(m.status)).map((m) => (
              <div key={m.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-[#231A12]">{m.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      m.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}>
                      {m.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[#7A6C5B]">
                    Amount: <strong className="text-[#231A12]">${m.amount} {m.currency}</strong>
                  </div>
                  {m.paypal_hosted_url && (
                    <div className="text-[11px] font-mono text-[#8C7D6C] truncate max-w-md">
                      Hosted Gateway: {m.paypal_hosted_url}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {m.status === 'invoiced' && m.paypal_hosted_url && (
                    <>
                      <a
                        href={m.paypal_hosted_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        Launch PayPal Checkout <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        disabled={reconcilingId === m.invoice_id}
                        onClick={() => m.invoice_id && simulatePayPalPayment(m.invoice_id)}
                        className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-purple-50 border border-[#DFD4C3] text-xs font-mono font-bold text-[#231A12] transition-colors"
                      >
                        {reconcilingId === m.invoice_id ? 'Simulating...' : 'Simulate Webhook Paid'}
                      </button>
                    </>
                  )}

                  {m.status === 'paid' && (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      Authoritative Payment Sealed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: TRUST LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#231A12]">Project Cryptographic Trust Chain</h2>
            <p className="text-xs text-[#6B5C4D]">Isolated per-project SHA-256 block succession sealing contracts, submissions, and payments.</p>
          </div>

          <div className="space-y-3">
            {trustEvents.map((e) => (
              <div key={e.id} className="glass-card p-5 rounded-2xl border border-white/90 shadow-glass space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-800 font-bold border border-purple-200">
                      BLOCK #{e.sequence_number}
                    </span>
                    <span className="text-[#231A12] font-bold">{e.event_type}</span>
                  </div>
                  <span className="text-[#8C7D6C]">{new Date(e.timestamp).toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-[#6B5C4D] pt-1">
                  <div className="truncate">Prev Hash: <span className="text-[#8C7D6C]">{e.prev_hash}</span></div>
                  <div className="truncate">Current Hash: <span className="text-emerald-700 font-bold">{e.current_hash}</span></div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/70 border border-[#EAE1D2] text-[11px] text-[#231A12] overflow-x-auto shadow-inner">
                  <pre>{JSON.stringify(e.payload, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
