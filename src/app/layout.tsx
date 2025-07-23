import { Providers } from './providers';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'GreenSuite',
    description: 'Sustainability Dashboard',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <Providers>

            <Suspense fallback={<LoadingSpinner fullScreen />}>
                {children}
            </Suspense>
        </Providers>
        </body>
        </html>
    );
}