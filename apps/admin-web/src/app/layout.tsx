import type { Metadata } from 'next';
import { Lato, Montserrat } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
});

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-lato',
  weight: ['400'],
  style: ['italic'],
});

export const metadata: Metadata = {
  title: {
    default: 'MC Labor Sources',
    template: '%s | MC Labor Sources',
  },
  description: 'Workforce management platform for MC Labor Sources, Inc.',
  icons: {
    icon: '/brand/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${lato.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
