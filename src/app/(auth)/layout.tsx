import { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (

        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white  bg-no-repeat bg-cover flex flex-col items-center justify-center p-4"
            style={{
                background: "radial-gradient(circle,rgba(87, 199, 133, 1) 0%, rgba(255, 255, 255, 1) 100%)"
            }}>
            <div className="w-full justify-center items-center flex">

                {children}

            </div>
        </div>
    );
}