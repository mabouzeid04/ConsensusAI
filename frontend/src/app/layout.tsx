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
    <html lang="en" className={inter.className}>
      <body>
        <header className="w-full border-b bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold">ConsensusAI</Link>
            <HeaderNav />
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
