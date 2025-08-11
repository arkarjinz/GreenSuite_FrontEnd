import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';


export default function RegisterPage() {
    return (
        <>
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8">

                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-6">
                        <span className="text-2xl font-bold text-green-900">GreenSuite</span>
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-green-900">Create your GreenSuite account</h1>
                    <p className="text-sm mt-2 text-gray-600">Start measuring and reducing your company&#39;s environmental impact</p>
                </div>
                <RegisterForm />

                <div className="mt-6 text-center text-sm text-gray-900">
                    <p>&copy; {new Date().getFullYear()} GreenSuite. All rights reserved.</p>
                </div>

            </div>

        </>
    );
}