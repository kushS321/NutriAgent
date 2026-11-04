import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
// import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import AuthGate from '@/components/auth/AuthGate';

export const metadata: Metadata = {
  title: 'NutriAgent — Know Your Food. Know Your Health.',
  description:
    'AI-powered food-label scanning and personal nutrition assistant. Decode ingredients, allergens, sugars, and sodium tailored to your personal health and dietary goals. "Can I Eat This?"',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF7F2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col pb-16 lg:pb-0 bg-beige-50 text-coffee-900 antialiased selection:bg-pencil-sage-200 selection:text-coffee-950 font-sans">
        {/* <DisclaimerBanner /> */}
        <Navbar />
        <main className="flex-1 flex flex-col"><AuthGate>{children}</AuthGate></main>
        <BottomNav />
        <Footer />
      </body>
    </html>
  );
}
