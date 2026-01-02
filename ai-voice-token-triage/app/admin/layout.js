import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI Voice-to-Token Triage System - Admin Dashboard',
  description: 'Aravind Eye Hospital - Admin Dashboard',
};

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}