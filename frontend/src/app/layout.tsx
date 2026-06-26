import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ThemeInitializer } from '@/components/layout/theme-init';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AIShoppingAssistant } from '@/components/ai/ai-assistant';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CogniCart — Intelligence Behind Every Purchase',
  description:
    'AI-powered personalized shopping platform. Discover products tailored to your taste with our hybrid recommendation engine.',
  keywords: [
    'ecommerce',
    'AI shopping',
    'personalized recommendations',
    'machine learning',
    'collaborative filtering',
  ],
  openGraph: {
    title: 'CogniCart — AI Shopping Platform',
    description:
      'Discover products tailored to your taste with AI-powered recommendations.',
    type: 'website',
    siteName: 'CogniCart',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased min-h-screen`}>
        <ThemeInitializer />
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <AIShoppingAssistant />
        </Providers>
      </body>
    </html>
  );
}
