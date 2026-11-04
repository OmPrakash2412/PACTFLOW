'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, ExternalLink, ShieldCheck, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import { api } from '../../../lib/api';
import { Invoice } from '../../../types';

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params?.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);

  const loadInvoice = async () => {
    if (!invoiceId) return;
    try {
      const data = await api.getInvoice(invoiceId);
      setInvoice(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const handleReconcile = async () => {
    if (!invoice) return;
    setReconciling(true);
    try {
      await api.reconcileInvoice(invoice.id);
      await loadInvoice();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReconciling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="py-24 text-center space-y-3">
        <h2 className="text-xl font-bold text-white">Invoice Not Found</h2>
        <Link href="/dashboard" className="text-primary text-xs font-mono">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="glass-panel p-8 rounded-2xl border border-navy-800 space-y-6">
        <div className="flex items-center justify-between border-b border-navy-800 pb-4">
          <div>
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">PayPal Sandbox Invoicing v2</span>
            <h1 className="text-2xl font-bold text-white mt-1">Invoice {invoice.paypal_invoice_number || invoice.id}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase ${
            invoice.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-primary/10 text-primary border border-primary/30'
          }`}>
            {invoice.status}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400">TOTAL AMOUNT</span>
            <div className="text-2xl font-bold text-white font-mono mt-0.5">${invoice.amount} {invoice.currency}</div>
          </div>
          <div className="text-right text-xs font-mono text-slate-400">
            <div>Invoice Date: {new Date(invoice.invoice_date).toLocaleDateString()}</div>
            {invoice.paypal_invoice_id && (
              <div className="text-slate-500 mt-1">PayPal Ref: {invoice.paypal_invoice_id}</div>
            )}
          </div>
        </div>

        {invoice.paypal_hosted_url && (
          <div className="space-y-3">
            <a
              href={invoice.paypal_hosted_url}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              Open PayPal Sandbox Hosted Payment Gateway
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={handleReconcile}
              disabled={reconciling}
              className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-850 text-slate-300 font-mono text-xs flex items-center justify-center gap-2 border border-navy-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reconciling ? 'animate-spin' : ''}`} />
              Authoritatively Reconcile with PayPal API
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

