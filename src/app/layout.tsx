import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { RoomProvider } from '@/context/RoomContext';
import { Navbar } from '@/components/common/Navbar';
import { BottomNav } from '@/components/common/BottomNav';
import { FloatingReactions } from '@/components/common/FloatingReactions';

export const metadata: Metadata = {
  title: 'UsTwo 💗 — Two hearts, one little world',
  description: 'A cute, romantic, real-time multiplayer world for two people to play games, answer questions, and make memories together.',
  keywords: ['couples game', 'multiplayer', 'romantic', 'kawaii', 'two player', 'games for couples'],
  authors: [{ name: 'UsTwo' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFD6E7',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-kawaii-cream text-kawaii-text flex flex-col antialiased selection:bg-pink-200 selection:text-pink-900 pb-20 md:pb-0">
        <AuthProvider>
          <RoomProvider>
            <FloatingReactions />
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <BottomNav />
          </RoomProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
