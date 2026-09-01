import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MuiProvider from '@/components/providers/MuiProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "ISP Digital Campus — Indicator Student's Point",
  description: "Academic and coaching center management platform for Indicator Student's Point.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body>
        <MuiProvider>{children}</MuiProvider>
      </body>
    </html>
  );
}
