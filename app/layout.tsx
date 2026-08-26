import './globals.css';
import type { Metadata, Viewport } from 'next';

const title = 'ApplyX — Application Command Center';
const description = 'Turn scattered college, scholarship and fellowship requirements into a clear path to submission.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title,
  description,
  openGraph: { title, description, type: 'website', siteName: 'ApplyX' },
  twitter: { card: 'summary', title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
