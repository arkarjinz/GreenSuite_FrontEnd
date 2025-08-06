"use client"
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce'; // Install: npm i use-debounce
import { Company } from '@/types/company';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { companyApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
    const router = useRouter();
    const { register, isLoading } = useAuth();
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        userName: '',
        email: '',
        password: '',
        companyRole: 'OWNER' as 'OWNER' | 'MANAGER' | 'EMPLOYEE',
        companyId: '',
        companyName: '',
        companyAddress: '',
        industry: ''
    });

    const [companyQuery, setCompanyQuery] = useState('');
    const [debouncedQuery] = useDebounce(companyQuery, 300);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [showCompanyResults, setShowCompanyResults] = useState(false);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [companySearchError, setCompanySearchError] = useState('');

    const isOwner = formData.companyRole === 'OWNER';

    // Fetch companies when query changes
    useEffect(() => {
        if (debouncedQuery.length > 2 && !isOwner) {
            setLoadingCompanies(true);
            companyApi.searchCompanies(debouncedQuery)
                .then(data => {
                    setCompanies(data);
                    setCompanySearchError('');
                })
                .catch(err => {
                    setCompanySearchError('Failed to search companies');
                    console.error(err);
                })
                .finally(() => setLoadingCompanies(false));
        } else {
            setCompanies([]);
        }
    }, [debouncedQuery, isOwner]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCompanySelect = (company: Company) => {
        setFormData(prev => ({
            ...prev,
            companyId: company.id,
            companyName: company.name
        }));
        setCompanyQuery(company.name);
        setShowCompanyResults(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        // Prepare payload based on role
        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            userName: formData.userName,
            email: formData.email,
            password: formData.password,
            companyRole: formData.companyRole,
            companyId: formData.companyId,
            companyName: formData.companyName,
            companyAddress: isOwner ? formData.companyAddress : undefined,
            industry: formData.industry
        };

        try {

            await register(payload);
            router.push('/pending');
        } catch (error) {
            if (error instanceof Error) {
                setFormError(error.message);
            } else {
                setFormError('Registration failed. Please try again.');
            }
        }
    };

    return (
        <div className="w-full max-w-3xl">
            {formError && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start">
                    <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{formError}</span>
                </div>
            )}

            {/* <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                    <FormField
                        label="First Name"
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />

                    <FormField
                        label="Last Name"
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <FormField
                    label="Username"
                    id="userName"
                    name="userName"
                    type="text"
                    value={formData.userName}
                    onChange={handleChange}
                    required
                />

                <FormField
                    label="Email Address"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <FormField
                    label="Password"
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    description="Must be at least 10 characters with uppercase, lowercase, number, and special character"
                />

                <div>
                    <label htmlFor="companyRole" className="block text-sm font-medium text-gray-700 mb-1">
                        Role in Company
                    </label>
                    <select
                        id="companyRole"
                        name="companyRole"
                        required
                        value={formData.companyRole}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="OWNER">Owner</option>
                        <option value="MANAGER">Manager</option>
                        <option value="EMPLOYEE">Employee</option>
                    </select>
                </div>

                {!isOwner ? (
                    <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>

                        <div className="mb-4">
                            <label htmlFor="companySearch" className="block text-sm font-medium text-gray-700 mb-1">
                                Search Company
                                {!formData.companyId && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <input
                                type="text"
                                id="companySearch"
                                name="companySearch"
                                value={companyQuery}
                                onChange={(e) => {
                                    setCompanyQuery(e.target.value);
                                    setShowCompanyResults(true);
                                }}
                                onFocus={() => setShowCompanyResults(true)}
                                required={!isOwner && !formData.companyId}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                placeholder="Start typing to search companies..."
                            />

                            {companySearchError && (
                                <p className="mt-1 text-sm text-red-600">{companySearchError}</p>
                            )}
                        </div>

                        {showCompanyResults && (
                            <div className="relative">
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {loadingCompanies ? (
                                        <div className="p-4 text-center text-gray-500">Searching...</div>
                                    ) : companies.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">No companies found</div>
                                    ) : (
                                        <ul>
                                            {companies.map(company => (
                                                <li
                                                    key={company.id}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                                                    onClick={() => handleCompanySelect(company)}
                                                >
                                                    <div className="font-medium">{company.name}</div>
                                                    <div className="text-sm text-gray-600">{company.address}</div>
                                                    <div className="text-sm text-gray-500">{company.industry}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}

                        {formData.companyId && (
                            <div className="mt-4 p-3 bg-green-50 rounded-md">
                                <div className="font-medium">Selected Company</div>
                                <div className="font-semibold">{formData.companyName}</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>

                        <div className="space-y-4">
                            <FormField
                                label="Company Name"
                                id="companyName"
                                name="companyName"
                                type="text"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                            />

                            <FormField
                                label="Company Address"
                                id="companyAddress"
                                name="companyAddress"
                                type="text"
                                value={formData.companyAddress}
                                onChange={handleChange}
                                required
                            />

                            <FormField
                                label="Industry"
                                id="industry"
                                name="industry"
                                type="text"
                                value={formData.industry}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    Create Account
                </Button>
            </form> */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-x-16 gap-y-6 px-6">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6 ">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="First Name"
                                id="firstName"
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                            <FormField
                                label="Last Name"
                                id="lastName"
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <FormField
                            label="Username"
                            id="userName"
                            name="userName"
                            type="text"
                            value={formData.userName}
                            onChange={handleChange}
                            required
                        />

                        <FormField
                            label="Email Address"
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <FormField
                            label="Password"
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            description="Must be at least 10 characters with uppercase, lowercase, number, and special character"
                        />
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">

                        {/* Role Dropdown */}
                        <div>
                            <label htmlFor="companyRole" className="block text-sm font-medium text-gray-700 mb-1">
                                Role in Company
                            </label>
                            <select
                                id="companyRole"
                                name="companyRole"
                                required
                                value={formData.companyRole}
                                onChange={handleChange}
                                className="w-full px-3 py-3 mb-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="OWNER">Owner</option>
                                <option value="MANAGER">Manager</option>
                                <option value="EMPLOYEE">Employee</option>
                            </select>
                        </div>

                        {/* Conditional Company Section */}
                        {!isOwner ? (
                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>

                                <div className="mb-4">
                                    <label htmlFor="companySearch" className="block text-sm font-medium text-gray-700 mb-1">
                                        Search Company
                                        {!formData.companyId && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        id="companySearch"
                                        name="companySearch"
                                        value={companyQuery}
                                        onChange={(e) => {
                                            setCompanyQuery(e.target.value);
                                            setShowCompanyResults(true);
                                        }}
                                        onFocus={() => setShowCompanyResults(true)}
                                        required={!isOwner && !formData.companyId}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder="Start typing to search companies..."
                                    />

                                    {companySearchError && (
                                        <p className="mt-1 text-sm text-red-600">{companySearchError}</p>
                                    )}
                                </div>

                                {showCompanyResults && (
                                    <div className="relative">
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {loadingCompanies ? (
                                                <div className="p-4 text-center text-gray-500">Searching...</div>
                                            ) : companies.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500">No companies found</div>
                                            ) : (
                                                <ul>
                                                    {companies.map(company => (
                                                        <li
                                                            key={company.id}
                                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                                                            onClick={() => handleCompanySelect(company)}
                                                        >
                                                            <div className="font-medium">{company.name}</div>
                                                            <div className="text-sm text-gray-600">{company.address}</div>
                                                            <div className="text-sm text-gray-500">{company.industry}</div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {formData.companyId && (
                                    <div className="mt-4 p-3 bg-green-50 rounded-md">
                                        <div className="font-medium">Selected Company</div>
                                        <div className="font-semibold">{formData.companyName}</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <FormField
                                    label="Company Name"
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                />
                                <FormField
                                    label="Company Address"
                                    id="companyAddress"
                                    name="companyAddress"
                                    type="text"
                                    value={formData.companyAddress}
                                    onChange={handleChange}
                                    required
                                />
                                <FormField
                                    label="Industry"
                                    id="industry"
                                    name="industry"
                                    type="text"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-4/5 mx-auto"
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    Create Account
                </Button>
            </form>


            <div className="mt-6 text-center text-sm text-gray-600">
                <p>
                    Already have an account?{' '}
                    <a href="/login" className="font-medium text-green-600 hover:text-green-500">
                        Sign in
                    </a>
                </p>
            </div>
        </div>

    );
}