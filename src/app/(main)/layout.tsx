import { ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="pt-16 flex-grow">
                {children}
            </div>
        </div>
    );
}