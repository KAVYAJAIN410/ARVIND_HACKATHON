import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI Voice-to-Token Triage System - Mobile Token',
  description: 'Aravind Eye Hospital - Mobile Token View',
};

export default function MobileTokenLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}