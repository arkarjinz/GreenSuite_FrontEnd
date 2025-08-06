import { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        // <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-4">
        //     <div className="w-full max-w-md">
        //         <div className="text-center mb-8">
        //             <Link href="/" className="inline-block mb-6">
        //                 <span className="text-2xl font-bold text-gray-900">GreenSuite</span>
        //             </Link>
        //         </div>
        //         {children}
        //         <div className="mt-8 text-center text-sm text-gray-600">
        //             <p>&copy; {new Date().getFullYear()} GreenSuite. All rights reserved.</p>
        //         </div>
        //     </div>
        // </div>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white bg-[url('/gn_bg.jpg')] bg-no-repeat bg-cover flex flex-col items-center justify-center p-4">
            <div className="w-full justify-center items-center flex">

                {children}

            </div>
        </div>
    );
}