import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Collaboration Workspace | PACTFLOW',
  description: 'Realtime milestone tracking, Gemini AI Evidence Inspector audits, dual-party digital signatures, and PayPal Sandbox invoicing.',
};

export default function ProjectWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

