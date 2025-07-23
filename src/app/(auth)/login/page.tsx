import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Sign in to GreenSuite</h1>
                <p className="mt-2 text-gray-600">Track and reduce your company&#39;s carbon footprint</p>
            </div>
            <LoginForm />
        </>
    );
}