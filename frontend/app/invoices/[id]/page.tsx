'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, ExternalLink, ShieldCheck, CheckCircle2, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
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
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="py-24 text-center space-y-3">
        <h2 className="text-xl font-bold text-[#231A12]">Invoice Not Found</h2>
        <Link href="/dashboard" className="text-purple-700 text-xs font-mono font-bold">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#7A6C5B] hover:text-[#231A12]">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="glass-card p-8 rounded-3xl border border-white/90 shadow-glass space-y-6">
        <div className="flex items-center justify-between border-b border-[#EAE1D2] pb-4">
          <div>
            <span className="text-xs font-mono text-emerald-800 font-bold uppercase tracking-wider">PayPal Sandbox Invoicing v2</span>
            <h1 className="text-2xl font-black text-[#231A12] mt-1">Invoice {invoice.paypal_invoice_number || invoice.id}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-bold ${
            invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-purple-100 text-purple-800 border border-purple-200'
          }`}>
            {invoice.status}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/70 border border-[#EAE1D2] flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-[#7A6C5B]">TOTAL AMOUNT</span>
            <div className="text-2xl font-black text-[#231A12] font-mono mt-0.5">${invoice.amount} {invoice.currency}</div>
          </div>
          <div className="text-right text-xs font-mono text-[#7A6C5B]">
            <div>Invoice Date: {new Date(invoice.invoice_date).toLocaleDateString()}</div>
            {invoice.paypal_invoice_id && (
              <div className="text-[#8C7D6C] mt-1">PayPal Ref: {invoice.paypal_invoice_id}</div>
            )}
          </div>
        </div>

        {invoice.paypal_hosted_url && (
          <div className="space-y-3">
            <a
              href={invoice.paypal_hosted_url}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              Launch PayPal Sandbox Payment Window <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        <div className="pt-4 border-t border-[#EAE1D2] flex items-center justify-between">
          <div className="text-xs font-mono text-[#7A6C5B]">
            Reconciliation with PayPal Sandbox API
          </div>
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            className="px-4 py-2 rounded-xl bg-white hover:bg-purple-50 text-xs font-bold text-[#231A12] hover:text-purple-700 border border-[#DFD4C3] flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reconciling ? 'animate-spin' : ''}`} />
            {reconciling ? 'Polling Sandbox...' : 'Reconcile Status'}
          </button>
        </div>
      </div>
    </div>
  );
}
