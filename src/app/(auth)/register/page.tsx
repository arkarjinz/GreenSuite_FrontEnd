import RegisterForm from '@/components/auth/RegisterForm';
import AuthLayout from '@/components/layout/AuthLayout';

export default function RegisterPage() {
    return (
        <AuthLayout
            title="Create your GreenSuite account"
            subtitle="Start measuring and reducing your company's environmental impact"
        >
            <RegisterForm />
        </AuthLayout>
    );
}