import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';


export default function LoginPage() {
    return (
        <>
            {/* <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Sign in to GreenSuite</h1>
                <p className="mt-2 text-gray-600">Track and reduce your company&#39;s carbon footprint</p>
            </div>
            
            <LoginForm /> */}
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-10 m-4 w-full max-w-lg">

                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-6">
                        <span className="text-2xl font-bold text-green-900">GreenSuite</span>
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-green-900">Sign in to GreenSuite</h1>
                    <p className=" text-sm mt-2 text-gray-600">Track and reduce your company&#39;s carbon footprint</p>
                </div>
                <LoginForm />

                <div className="mt-6 text-center text-sm text-gray-900">
                    <p>&copy; {new Date().getFullYear()} GreenSuite. All rights reserved.</p>
                </div>

            </div>


        </>
    );
}