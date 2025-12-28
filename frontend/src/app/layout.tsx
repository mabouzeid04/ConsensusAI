import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import HeaderNav from '../components/HeaderNav';
import Brand from '../components/Brand';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: "ConsensusAI - Compare AI Models",
  description: "Compare responses from different AI models and see how they evaluate each other.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans min-h-screen bg-background text-content-primary selection:bg-primary/30 selection:text-primary-100`}>
        <script dangerouslySetInnerHTML={{ __html: `(() => { try { const stored = localStorage.getItem('theme'); const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; const theme = stored || (prefersDark ? 'dark' : 'light'); document.documentElement.setAttribute('data-theme', theme); } catch (e) {} })();` }} />

        {/* Ambient Background Effects */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="w-full border-b border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <Brand />
              <HeaderNav />
            </div>
          </header>
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
