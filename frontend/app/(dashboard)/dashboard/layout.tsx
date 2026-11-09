import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Management Center | PACTFLOW',
  description: 'Manage active freelance contracts, inspect Gemini AI deliverable verification reports, and authorize PayPal Sandbox milestone invoices.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

