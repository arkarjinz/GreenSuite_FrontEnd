"use client"
import { useAuth } from '@/contexts/AuthContext';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
    const { isLoading } = useAuth();

    // Add a small delay to prevent layout shift
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading application...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}