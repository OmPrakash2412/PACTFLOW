import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'PACTFLOW | Where Work Meets Trust',
  description: 'AI-Powered Agreement, Deliverable Verification and PayPal Milestone Payment Coordination Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF7F2] text-[#2D251E] flex flex-col antialiased selection:bg-purple-200 selection:text-purple-900 relative">
        {/* Subtle warm glassy backdrop orbs */}
        <div className="fixed -top-40 -left-40 w-96 h-96 bg-amber-200/35 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="fixed top-1/3 -right-32 w-[30rem] h-[30rem] bg-purple-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
