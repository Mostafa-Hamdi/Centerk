import type { Metadata, Viewport } from 'next';
import { Alexandria, IBM_Plex_Sans_Arabic } from 'next/font/google';
import type { ReactNode } from 'react';
import { brand } from '@/config/brand';
import { sidebarInitScript } from '@/config/sidebar';
import { ar } from '@/i18n/ar';
import { env } from '@/lib/env';
import { Providers } from './providers';
import '@/styles/globals.css';

const fontDisplay = Alexandria({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-alexandria',
});

const fontBody = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-plex-arabic',
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: { default: ar.app.name, template: `%s | ${ar.app.name}` },
  description: ar.app.description,
  applicationName: ar.app.name,
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    siteName: ar.app.name,
    title: ar.app.name,
    description: ar.app.description,
  },
  twitter: { card: 'summary', title: ar.app.name, description: ar.app.description },
};

export const viewport: Viewport = {
  themeColor: brand.themeColor,
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${fontDisplay.variable} ${fontBody.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the saved sidebar state before paint (no layout shift). */}
        <script dangerouslySetInnerHTML={{ __html: sidebarInitScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
