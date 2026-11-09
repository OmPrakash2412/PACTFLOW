import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Empty State Showcase | PACTFLOW',
  description: 'Demonstration of PACTFLOW zero-data empty state interface for new workspaces, unassigned contracts, and unmined ledgers.',
};

export default function EmptyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

