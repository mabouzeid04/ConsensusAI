import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import HeaderNav from '../components/HeaderNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ConsensusAI - Compare AI Models',
  description: 'Compare responses from different AI models and see how they evaluate each other.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className} data-theme="light">
      <body>
        <script dangerouslySetInnerHTML={{ __html: `(() => { try { const stored = localStorage.getItem('theme'); const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; const theme = stored || (prefersDark ? 'dark' : 'light'); document.documentElement.setAttribute('data-theme', theme); } catch (e) {} })();` }} />
        <header className="w-full border-b bg-base-100">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between text-base-content">
            <Link href="/" className="text-lg font-semibold hover:text-primary">ConsensusAI</Link>
            <HeaderNav />
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
