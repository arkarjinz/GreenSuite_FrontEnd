"use client"
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import {LoginDto} from "@/types/auth";
import {useRouter} from "next/navigation";

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [formError, setFormError] = useState('');
    const { login, isLoading } = useAuth();
     const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        try {
            const loginDto:LoginDto={
                email: email,
                password: password
            }
            await login(loginDto);
            router.push("/dashboard");
        } catch (error) {
            if (error instanceof Error) {
                setFormError(error.message);
            } else {
                setFormError('Login failed. Please try again later.');
            }
        }
    };

    return (
        <div className="w-full max-w-md">
            {formError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start">
                    <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{formError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <FormField
                    label="Email Address"
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                />

                <FormField
                    label="Password"
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                />

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Remember me</span>
                    </label>

                    <a href="/forgot-password" className="text-sm text-green-600 hover:text-green-500">
                        Forgot password?
                    </a>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-2"
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    Sign in
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
                <p>
                    Don&#39;t have an account?{' '}
                    <a href="/register" className="font-medium text-green-600 hover:text-green-500">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}