"use client"
import { ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';
import AuthInitializer from '@/components/auth/AuthInitializer';

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <AuthInitializer>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="pt-16">
                    {children}
                </main>
            </div>
        </AuthInitializer>
    );
}