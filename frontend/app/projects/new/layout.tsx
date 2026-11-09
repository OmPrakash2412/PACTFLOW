import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Verifiable Project | Gemini Pact Architect | PACTFLOW',
  description: 'Synthesize structured milestone contracts and testable acceptance criteria with Google Gemini 2.0 AI.',
};

export default function NewProjectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

