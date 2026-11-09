import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PayPal Invoicing v2 Settlement | PACTFLOW',
  description: 'Authoritative PayPal Sandbox settlement details and cryptographic Trust Ledger payment reconciliation.',
};

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
