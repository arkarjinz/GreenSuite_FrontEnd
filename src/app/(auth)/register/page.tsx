import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
    return (
        <>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Create your GreenSuite account</h1>
                <p className="mt-2 text-gray-600">Start measuring and reducing your company&#39;s environmental impact</p>
            </div>
            <RegisterForm />
        </>
    );
}