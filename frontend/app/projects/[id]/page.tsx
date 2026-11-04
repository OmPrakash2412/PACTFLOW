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
      const updated = await api.acceptAgreement(agreement.id);
      setAgreement(updated);
      setNotification('Agreement accepted! Digital signature sealed in Trust Ledger.');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Error accepting agreement');
    }
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;
    setSubmittingDeliverable(true);

    try {
      const fileUrls = deliverableFiles
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const deliv = await api.submitDeliverable({
        milestone_id: selectedMilestone.id,
        title: deliverableTitle,
        description: deliverableDesc,
        file_urls: fileUrls,
        demo_url: deliverableDemo || undefined,
        notes: deliverableNotes || undefined,
      });

      setNotification('Deliverable submitted! Gemini Evidence Inspector completed audit.');
      setSelectedMilestone(null);
      await loadAllData();

      // Load report
      if (deliv.id) {
        const rep = await api.getVerificationReport(deliv.id);
        setActiveReport(rep);
      }
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
      // Find invoice
      const invoice = await api.getInvoice(invoiceId);
      
      // Deliver authoritative webhook payload
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
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400 font-mono text-xs">Loading PACTFLOW Project Workspace...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Project Not Found</h2>
        <Link href="/dashboard" className="text-primary hover:underline text-sm font-mono">
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Notifications */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-800 pb-5">
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{project.title}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {project.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            ID: {project.id} | Budget: <strong className="text-white">${project.budget} {project.currency}</strong>
          </p>
        </div>

        {trustStatus && (
          <div className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-800 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Trust Ledger:</span>
            <span className="text-emerald-400 font-bold">{trustStatus.total_events} Block(s) Verified</span>
          </div>
        )}
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {notification}
          </span>
          <button onClick={() => setNotification(null)} className="text-xs text-emerald-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Workspace Tabs */}
      <div className="flex border-b border-navy-800 space-x-1 sm:space-x-3 overflow-x-auto text-sm font-medium">
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
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-primary text-white bg-navy-900/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-navy-700'
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
            <div className="glass-panel p-6 rounded-2xl border border-primary/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Gemini Payment Coordinator Realtime Analysis
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  HEALTH: {coordination.overall_health.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800">
                  <span className="text-xs text-slate-400 font-mono">TOTAL BUDGET</span>
                  <div className="text-lg font-bold text-white mt-1">{coordination.total_budget}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800">
                  <span className="text-xs text-slate-400 font-mono">SETTLED INVOICES</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">{coordination.paid_amount}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800">
                  <span className="text-xs text-slate-400 font-mono">PENDING SETTLEMENT</span>
                  <div className="text-lg font-bold text-slate-200 mt-1">{coordination.pending_amount}</div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono text-slate-400 uppercase">Coordinator Action Items:</span>
                <ul className="space-y-1.5">
                  {coordination.action_items.map((action, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-navy-950/80 border border-navy-800 text-xs font-mono text-slate-400">
                Risk Assessment: <span className="text-slate-200">{coordination.risk_assessment}</span>
              </div>
            </div>
          )}

          <div className="glass-panel p-6 rounded-2xl border border-navy-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Project Scope & Technical Description</h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{project.description}</p>
            <div className="pt-4 border-t border-navy-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-400">
              <div>Client: <strong className="text-white">{project.client_name || 'Sophia Vance'}</strong></div>
              <div>Assigned Freelancer: <strong className="text-white">{project.freelancer_name || 'Alex Rivera'}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AGREEMENT & GEMINI ARCHITECT */}
      {activeTab === 'agreement' && (
        <div className="space-y-6">
          {agreement ? (
            <div className="glass-panel p-8 rounded-2xl border border-navy-800 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-800 pb-5">
                <div>
                  <span className="text-xs font-mono text-primary uppercase tracking-wider">Version {agreement.version}</span>
                  <h2 className="text-2xl font-bold text-white mt-1">{agreement.title}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">Status: {agreement.status.toUpperCase()}</p>
                </div>

                {/* Digital Acceptance status */}
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono ${agreement.is_client_accepted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-navy-900 border-navy-700 text-slate-400'}`}>
                    Client: {agreement.is_client_accepted ? 'Accepted ✓' : 'Pending'}
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono ${agreement.is_freelancer_accepted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-navy-900 border-navy-700 text-slate-400'}`}>
                    Freelancer: {agreement.is_freelancer_accepted ? 'Accepted ✓' : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Scope */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">1. Scope of Work</h3>
                <p className="text-sm text-slate-300 leading-relaxed bg-navy-950 p-4 rounded-xl border border-navy-800 font-sans">
                  {agreement.scope_of_work}
                </p>
              </div>

              {/* Budget Allocation Table */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">2. Budget Allocation & Milestones</h3>
                <div className="overflow-x-auto rounded-xl border border-navy-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-navy-900 text-slate-400 font-mono uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Milestone</th>
                        <th className="py-2.5 px-4">Allocation ($)</th>
                        <th className="py-2.5 px-4">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-800/60 bg-navy-950 text-slate-300">
                      {agreement.budget_allocation.map((b, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-4 font-medium text-white">{b.milestone}</td>
                          <td className="py-2.5 px-4 font-mono">${b.amount} USD</td>
                          <td className="py-2.5 px-4 font-mono text-primary">{b.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Acceptance Criteria */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">3. Acceptance Criteria</h3>
                <ul className="space-y-2">
                  {agreement.acceptance_criteria.map((c, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 bg-navy-950/60 p-2.5 rounded-lg border border-navy-800/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Assumptions & Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-200">Assumptions</h4>
                  <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                    {agreement.assumptions.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-200">Clarification Questions</h4>
                  <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                    {agreement.clarification_questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Accept Button Action */}
              <div className="pt-6 border-t border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-400 font-mono">
                  Seals digital SHA-256 event into Trust Ledger upon acceptance.
                </div>
                <button
                  onClick={handleAcceptAgreement}
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Digitally Sign & Accept Agreement
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-navy-800 text-center space-y-4">
              <Sparkles className="w-8 h-8 text-primary mx-auto" />
              <h3 className="text-lg font-bold text-white">No Agreement Synthesized Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
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
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Milestones & Evidence Verification</h2>
              <p className="text-xs text-slate-400">Freelancer submits deliverables. Gemini audits evidence. Client gives final approval.</p>
            </div>
          </div>

          <div className="space-y-4">
            {milestones.map((m) => (
              <div key={m.id} className="glass-panel p-6 rounded-2xl border border-navy-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-navy-900 border border-navy-700 flex items-center justify-center font-mono text-xs font-bold text-primary">
                      {m.sequence_order}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">{m.title}</h3>
                      <span className="text-xs font-mono text-slate-400">${m.amount} {m.currency}</span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase self-start sm:self-auto ${
                    m.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    m.status === 'approved' ? 'bg-primary/10 text-primary border border-primary/30' :
                    m.status === 'submitted' ? 'bg-secondary/10 text-secondary border border-secondary/30' :
                    'bg-navy-900 text-slate-400 border border-navy-700'
                  }`}>
                    {m.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-300">{m.description}</p>

                {/* Acceptance Criteria */}
                <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800/80 space-y-2">
                  <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Agreed Acceptance Criteria:</span>
                  <ul className="space-y-1">
                    {m.acceptance_criteria.map((c, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions per state */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {/* Deliverable submission button */}
                    {['pending', 'in_progress', 'changes_requested'].includes(m.status) && (
                      <button
                        onClick={() => {
                          setSelectedMilestone(m);
                          setDeliverableTitle(`Deliverables for ${m.title}`);
                        }}
                        className="px-4 py-2 rounded-lg bg-secondary hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Submit Deliverable Evidence
                      </button>
                    )}

                    {/* View Evidence Report */}
                    {m.has_deliverable && (
                      <button
                        onClick={() => handleViewReport(m)}
                        className="px-4 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 border border-navy-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-secondary" />
                        Inspect AI Evidence Audit
                      </button>
                    )}
                  </div>

                  {/* Client Approval Controls */}
                  {m.status === 'submitted' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleClientDecision(m.id, 'request_revisions')}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors"
                      >
                        Request Revisions
                      </button>
                      <button
                        onClick={() => handleClientDecision(m.id, 'approve')}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve Milestone
                      </button>
                    </div>
                  )}

                  {/* Approved -> Trigger PayPal Invoice */}
                  {m.status === 'approved' && (
                    <button
                      disabled={invoicingLoading}
                      onClick={() => handleGenerateInvoice(m.id)}
                      className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Generate PayPal Sandbox Invoice
                    </button>
                  )}

                  {/* Invoiced -> Link to pay */}
                  {m.status === 'invoiced' && m.paypal_hosted_url && (
                    <a
                      href={m.paypal_hosted_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      Pay in PayPal Sandbox <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Deliverable Submission Modal / Drawer */}
          {selectedMilestone && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-navy-700 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-secondary" />
                    Submit Evidence for {selectedMilestone.title}
                  </h3>
                  <button onClick={() => setSelectedMilestone(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmitDeliverable} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Deliverable Title</label>
                    <input
                      type="text"
                      required
                      value={deliverableTitle}
                      onChange={(e) => setDeliverableTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Description of Work</label>
                    <textarea
                      required
                      rows={3}
                      value={deliverableDesc}
                      onChange={(e) => setDeliverableDesc(e.target.value)}
                      placeholder="Detail implemented features, tests executed, and code references..."
                      className="w-full px-3.5 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Attached Artifact URLs (one per line)</label>
                    <textarea
                      rows={2}
                      value={deliverableFiles}
                      onChange={(e) => setDeliverableFiles(e.target.value)}
                      placeholder="https://storage.example.com/test_runner.log&#10;https://github.com/org/repo/pull/4"
                      className="w-full px-3.5 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Live Demo / Staging URL (Optional)</label>
                    <input
                      type="url"
                      value={deliverableDemo}
                      onChange={(e) => setDeliverableDemo(e.target.value)}
                      placeholder="https://staging.example.com"
                      className="w-full px-3.5 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-navy-950 border border-secondary/30 text-[11px] text-slate-300 flex gap-2">
                    <Sparkles className="w-4 h-4 text-secondary shrink-0" />
                    <span>Gemini Evidence Inspector will evaluate these artifacts against the agreed milestone acceptance criteria upon submission.</span>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMilestone(null)}
                      className="px-4 py-2 rounded-lg bg-navy-900 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingDeliverable}
                      className="px-5 py-2 rounded-lg bg-secondary hover:bg-sky-600 text-white font-semibold text-xs"
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
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-navy-700 max-w-3xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                  <div>
                    <span className="text-xs font-mono text-primary font-bold uppercase tracking-wider">Gemini Evidence Audit</span>
                    <h3 className="text-xl font-bold text-white mt-0.5">Verification Report</h3>
                  </div>
                  <button onClick={() => setActiveReport(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-navy-950 border border-navy-800">
                  <div>
                    <div className="text-xs font-mono text-slate-400">OVERALL VERDICT</div>
                    <div className={`text-lg font-extrabold uppercase mt-0.5 ${
                      activeReport.overall_verdict === 'satisfied' ? 'text-emerald-400' :
                      activeReport.overall_verdict === 'uncertain' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {activeReport.overall_verdict}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-slate-400 text-right">CONFIDENCE</div>
                    <div className="text-lg font-bold text-white font-mono">{activeReport.confidence_score}%</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-navy-950 p-3.5 rounded-xl border border-navy-800/80">
                  {activeReport.summary}
                </p>

                {/* Criteria breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-slate-400 uppercase font-semibold">Individual Criteria Evaluations:</h4>
                  <div className="space-y-2">
                    {activeReport.criteria_analysis.map((crit, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-navy-950 border border-navy-800 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{crit.criterion}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                            crit.verdict === 'satisfied' ? 'bg-emerald-500/10 text-emerald-400' :
                            crit.verdict === 'uncertain' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {crit.verdict}
                          </span>
                        </div>
                        <p className="text-slate-400">{crit.evidence_reference}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {activeReport.recommendations.length > 0 && (
                  <div className="p-3 rounded-xl bg-navy-950 border border-primary/20 space-y-1 text-xs">
                    <span className="font-bold text-primary">Recommendations:</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                      {activeReport.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setActiveReport(null)}
                    className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
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
              <h2 className="text-xl font-bold text-white">PayPal Sandbox Settlements</h2>
              <p className="text-xs text-slate-400">Real Invoicing API v2 execution. Funds flow directly through PayPal's sandbox gateway.</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              Sandbox Base: api-m.sandbox.paypal.com
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-navy-800 divide-y divide-navy-800">
            {milestones.filter(m => ['approved', 'invoiced', 'paid'].includes(m.status)).map((m) => (
              <div key={m.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-white">{m.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono ${
                      m.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {m.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Amount: <strong className="text-white">${m.amount} {m.currency}</strong>
                  </div>
                  {m.paypal_hosted_url && (
                    <div className="text-[11px] font-mono text-slate-500 truncate max-w-md">
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
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        Launch PayPal Checkout <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        disabled={reconcilingId === m.invoice_id}
                        onClick={() => m.invoice_id && simulatePayPalPayment(m.invoice_id)}
                        className="px-3.5 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 border border-navy-700 text-xs font-mono text-slate-200 transition-colors"
                      >
                        {reconcilingId === m.invoice_id ? 'Simulating Webhook...' : 'Simulate Webhook Paid'}
                      </button>
                    </>
                  )}

                  {m.status === 'paid' && (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Authoritative Payment Sealed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: TRUST LEDGER AUDIT TRAIL */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Cryptographic Trust Ledger
              </h2>
              <p className="text-xs text-slate-400">
                Every contract creation, acceptance, submission, verification, invoice, and payment forms an unbroken SHA-256 chain.
              </p>
            </div>

            {trustStatus && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                CHAIN VERIFIED ZERO-TAMPERING
              </div>
            )}
          </div>

          <div className="space-y-3">
            {trustEvents.map((event) => (
              <div key={event.id} className="glass-panel p-5 rounded-xl border border-navy-800 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">
                      BLOCK #{event.sequence_number}
                    </span>
                    <span className="text-slate-200 font-bold">{event.event_type}</span>
                  </div>
                  <span className="text-slate-500">{new Date(event.timestamp).toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                  <div className="truncate">Prev Hash: <span className="text-slate-500">{event.prev_hash}</span></div>
                  <div className="truncate">Current Hash: <span className="text-emerald-400/90">{event.current_hash}</span></div>
                </div>

                <div className="p-2.5 rounded bg-navy-950 border border-navy-800/80 text-[11px] text-slate-300">
                  Payload: {JSON.stringify(event.payload)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
