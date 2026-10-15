import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WhiteCut AI — Serverless Vox-Style Video Engine',
  description: 'Automated 100% free-to-operate micro-content video editing engine with phonetic Hinglish captions and Vox-style motion graphics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-terracotta selection:text-white">
        {children}
      </body>
    </html>
  );
}
