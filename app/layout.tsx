import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JARVIS · Conrad',
  description: 'Lindsey Conrad command HUD — Goldfront / Revolution',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%2305080c'/%3E%3Ccircle cx='16' cy='16' r='7' fill='none' stroke='%2300e5ff' stroke-width='1.5'/%3E%3Ccircle cx='16' cy='16' r='2.5' fill='%2300e5ff'/%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#05080c',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
