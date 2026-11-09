import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In to PACTFLOW | Gateway',
  description: 'Enter your credentials or choose a 1-click demo profile (Client or Freelancer) to access the PACTFLOW milestone protocol.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

