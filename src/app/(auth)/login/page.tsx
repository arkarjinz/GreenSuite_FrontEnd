import LoginForm from '@/components/auth/LoginForm';
import AuthLayout from "@/components/layout/AuthLayout";

export default function LoginPage() {
    return (
        <AuthLayout
            title="Sign in to GreenSuite"
            subtitle="Track and reduce your company's carbon footprint"
        >
            <LoginForm />
        </AuthLayout>
    );
}