import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Settings & Accounts | PACTFLOW',
  description: 'Configure your profile identity, role views, and PayPal Developer Sandbox settlement addresses.',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

