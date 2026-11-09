import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cryptographic Trust Ledger Explorer | PACTFLOW',
  description: 'Deterministic SHA-256 hash chain providing immutable, tamper-evident audit logs of agreements, deliverables, and PayPal settlements.',
};

export default function LedgerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

