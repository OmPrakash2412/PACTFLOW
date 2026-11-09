import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | PACTFLOW',
  description: 'Register for PACTFLOW as a Client or Freelancer to coordinate verifiable contracts, deliverable reviews, and PayPal milestone settlements.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

