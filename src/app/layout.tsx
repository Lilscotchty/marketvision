
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { NotificationProvider } from '@/contexts/notification-context';
import StyledComponentsRegistry from './registry'; // <-- 1. Import the registry

export const metadata: Metadata = {
  title: 'FinSight AI',
  description: 'Advanced trading tools and insights by FinSight AI',
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <body className={`${inter.variable} font-body antialiased`}>
        <StyledComponentsRegistry> {/* <-- 2. Wrap your providers */}
          <ThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                <AppLayout>{children}</AppLayout>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </StyledComponentsRegistry>
        <Toaster />
      </body>
    </html>
  );
}
