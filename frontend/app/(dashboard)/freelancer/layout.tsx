import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Freelancer Delivery Hub | PACTFLOW',
  description: 'Submit milestone deliverable evidence, review Gemini zero-trust audit feedback, and track direct PayPal Sandbox settlement disbursements.',
};

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

