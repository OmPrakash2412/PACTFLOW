import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FAF7F2',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://pactflow.io'),
  title: {
    default: 'PACTFLOW | Where Work Meets Trust - AI & PayPal Milestone Coordination',
    template: '%s | PACTFLOW'
  },
  description: 'AI-powered agreement synthesis, objective deliverable verification, and PayPal Developer Sandbox milestone settlement coordination with cryptographic SHA-256 trust ledgers.',
  keywords: [
    'freelance coordination',
    'PayPal milestone invoicing',
    'Gemini AI agreement architect',
    'deliverable verification',
    'cryptographic trust ledger',
    'SHA-256 blockchain alternative',
    'zero-escrow freelance protocol'
  ],
  authors: [{ name: 'PACTFLOW Protocol', url: 'https://pactflow.io' }],
  creator: 'PACTFLOW',
  publisher: 'PACTFLOW Protocol',
  applicationName: 'PACTFLOW',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pactflow.io',
    siteName: 'PACTFLOW',
    title: 'PACTFLOW | Where Work Meets Trust',
    description: 'AI-powered agreement synthesis, objective deliverable verification, and PayPal Developer Sandbox milestone settlement coordination.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PACTFLOW | Where Work Meets Trust',
    description: 'Decentralized freelance milestone coordination powered by Google Gemini 2.0 and PayPal Developer Sandbox.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col antialiased selection:bg-amber-100 selection:text-stone-900 relative w-full overflow-x-hidden">
        {/* Subtle, soft ambient lighting (No noisy glowing orbs) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] bg-[#EDE4D5]/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-stone-100/50 rounded-full blur-3xl" />
        </div>

        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
