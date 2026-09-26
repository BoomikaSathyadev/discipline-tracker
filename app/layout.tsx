import type { Metadata, Viewport } from 'next';
import './globals.css';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Discipline Tracker',
  description: 'Personal daily discipline and habit tracker',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthGuard>
          <main className="pb-24 min-h-screen">
            {children}
          </main>
        </AuthGuard>
      </body>
    </html>
  );
}
