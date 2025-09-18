
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { NotificationProvider } from '@/contexts/notification-context'; // Import NotificationProvider

export const metadata: Metadata = {
  title: 'FinSight AI',
  description: 'Advanced trading tools and insights by FinSight AI',
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Remove hardcoded className="dark"
    <html lang="en" suppressHydrationWarning> 
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider> {/* Wrap AppLayout with NotificationProvider */}
              <AppLayout>{children}</AppLayout>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
