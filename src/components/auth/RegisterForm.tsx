"use client"
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Company } from '@/types/company';
import { useAuth } from '@/contexts/AuthContext';
import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { companyApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api"; // Added import for authApi

export default function RegisterForm() {
    const router = useRouter();
    const { register, isLoading } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [formError, setFormError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    
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
            console.log('🔍 Searching companies with query:', debouncedQuery);
            setLoadingCompanies(true);
            companyApi.searchCompanies(debouncedQuery)
                .then(data => {
                    console.log('✅ Companies found:', data);
                    setCompanies(data);
                    setCompanySearchError('');
                })
                .catch(err => {
                    console.error('❌ Company search failed:', err);
                    setCompanySearchError('Failed to search companies');
                    setCompanies([]);
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

    const canProceedToStep2 = () => {
        return formData.firstName && formData.lastName && formData.userName && formData.email && formData.password;
    };

    const canSubmitForm = () => {
        if (isOwner) {
            return formData.firstName && formData.lastName && formData.userName && formData.email && formData.password &&
                   formData.companyName && formData.companyAddress && formData.industry;
        } else {
            return formData.firstName && formData.lastName && formData.userName && formData.email && formData.password &&
                   formData.companyId && formData.companyName;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        // Validate required fields
        if (isOwner) {
            if (!formData.companyName || !formData.companyAddress || !formData.industry) {
                setFormError('Please fill in all required company information.');
                return;
            }
        } else {
            if (!formData.companyId || !formData.companyName) {
                setFormError('Please select a company.');
                return;
            }
        }

        // Validate password requirements
        if (formData.password.length < 8) {
            setFormError('Password must be at least 8 characters long.');
            return;
        }

        // Check for at least one uppercase letter, one lowercase letter, and one number
        const hasUpperCase = /[A-Z]/.test(formData.password);
        const hasLowerCase = /[a-z]/.test(formData.password);
        const hasNumbers = /\d/.test(formData.password);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            setFormError('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setFormError('Please enter a valid email address.');
            return;
        }

        // Validate username format
        if (formData.userName.length < 3) {
            setFormError('Username must be at least 3 characters long.');
            return;
        }

        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(formData.userName)) {
            setFormError('Username can only contain letters, numbers, and underscores.');
            return;
        }

        // Validate name format
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(formData.firstName) || !nameRegex.test(formData.lastName)) {
            setFormError('Names can only contain letters and spaces.');
            return;
        }

        // Validate company name format
        if (isOwner && (!formData.companyName || formData.companyName.trim().length === 0)) {
            setFormError('Company name is required.');
            return;
        }

        const companyNameRegex = /^[a-zA-Z0-9\s\-&.,]+$/;
        if (isOwner && !companyNameRegex.test(formData.companyName)) {
            setFormError('Company name can only contain letters, numbers, spaces, hyphens, ampersands, and periods.');
            return;
        }

        // Validate company address and industry for OWNER role
        if (isOwner) {
            if (!formData.companyAddress || formData.companyAddress.trim().length === 0) {
                setFormError('Company address is required.');
                return;
            }

            if (!formData.industry || formData.industry.trim().length === 0) {
                setFormError('Industry is required.');
                return;
            }

            const addressRegex = /^[a-zA-Z0-9\s\-&.,#]+$/;
            if (!addressRegex.test(formData.companyAddress)) {
                setFormError('Company address can only contain letters, numbers, spaces, hyphens, ampersands, periods, and hash symbols.');
                return;
            }

            const industryRegex = /^[a-zA-Z\s\-&]+$/;
            if (!industryRegex.test(formData.industry)) {
                setFormError('Industry can only contain letters, spaces, hyphens, and ampersands.');
                return;
            }
        }

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            userName: formData.userName,
            email: formData.email,
            password: formData.password,
            companyRole: formData.companyRole,
            companyName: formData.companyName,
            ...(isOwner ? {
                companyAddress: formData.companyAddress,
                industry: formData.industry
            } : {
                companyId: formData.companyId
            })
        };

        // Final validation - ensure no undefined values
        const hasUndefinedValues = Object.values(payload).some(value => value === undefined);
        if (hasUndefinedValues) {
            console.error('❌ Payload contains undefined values:', payload);
            setFormError('Please fill in all required fields.');
            return;
        }

        // Check for empty strings
        const hasEmptyStrings = Object.entries(payload).some(([key, value]) => {
            if (typeof value === 'string') {
                return value.trim().length === 0;
            }
            return false;
        });
        
        if (hasEmptyStrings) {
            console.error('❌ Payload contains empty strings:', payload);
            setFormError('Please fill in all required fields.');
            return;
        }

        // Test JSON serialization
        try {
            JSON.stringify(payload);
        } catch (error) {
            console.error('❌ Payload cannot be serialized to JSON:', error);
            setFormError('Invalid form data. Please try again.');
            return;
        }

        console.log('📝 Registration payload:', payload);
        console.log('🔍 Is owner:', isOwner);
        console.log('🔍 Company role:', formData.companyRole);
            
        try {
            // Test backend connectivity first
            console.log('🏥 Testing backend connectivity before registration...');
            const isBackendReachable = await authApi.healthCheck();
            
            if (!isBackendReachable) {
                setFormError('Unable to connect to the server. Please check your internet connection and try again.');
                return;
            }
            
            // Test backend port
            console.log('🔍 Testing backend port...');
            const portTest = await authApi.testBackendPort();
            if (!portTest.isRunning) {
                setFormError(`Backend is not running on port ${portTest.port}. Please ensure the backend server is started.`);
                return;
            }
            
            // Test if backend is Spring Boot
            console.log('🔍 Testing if backend is Spring Boot...');
            const springBootTest = await authApi.testSpringBootBackend();
            if (!springBootTest.isSpringBoot) {
                console.warn('⚠️ Backend might not be a Spring Boot application:', springBootTest.details);
                // Don't fail here, just log a warning
            } else {
                console.log('✅ Backend is confirmed to be Spring Boot');
            }
            
            await register(payload);
            router.push('/pending');
        } catch (error) {
            console.error('❌ Registration error in form:', error);
            if (error instanceof Error) {
                console.error('❌ Error message:', error.message);
                console.error('❌ Error stack:', error.stack);
                setFormError(error.message);
            } else {
                console.error('❌ Unknown error type:', typeof error);
                setFormError('Registration failed. Please try again.');
            }
        }
    };

    return (
        <div className="space-y-3">
            {formError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start">
                    <ExclamationCircleIcon className="h-3 w-3 mr-1.5 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{formError}</span>
                </div>
            )}

            {/* Compact Progress Indicator */}
            <div className="flex items-center justify-center space-x-3 mb-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${currentStep >= 1 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-gray-400'} transition-all duration-200`}>
                    {currentStep > 1 ? (
                        <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                        <span className="text-xs font-semibold">1</span>
                    )}
                </div>
                <div className={`w-8 h-0.5 ${currentStep > 1 ? 'bg-emerald-500' : 'bg-gray-300'} transition-all duration-200`}></div>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${currentStep >= 2 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-gray-400'} transition-all duration-200`}>
                    <span className="text-xs font-semibold">2</span>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {currentStep === 1 ? (
                    /* Step 1: Personal Information */
                    <div className="space-y-3">
                        <div className="text-center mb-2">
                            <h3 className="text-sm font-semibold text-gray-800">Personal Information</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('firstName')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className="w-full px-2.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-xs"
                                    placeholder="First name"
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('lastName')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className="w-full px-2.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-xs"
                                    placeholder="Last name"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="userName" className="block text-xs font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <input
                                id="userName"
                                name="userName"
                                type="text"
                                value={formData.userName}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('userName')}
                                onBlur={() => setFocusedField(null)}
                                required
                                className="w-full px-2.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-xs"
                                placeholder="Choose a username"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                required
                                className="w-full px-2.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-xs"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className="w-full px-2.5 py-2 pr-8 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-xs"
                                    placeholder="Create a password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-emerald-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-3 w-3" />
                                    ) : (
                                        <EyeIcon className="h-3 w-3" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => canProceedToStep2() && setCurrentStep(2)}
                            disabled={!canProceedToStep2()}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center text-sm"
                        >
                            <span>Continue</span>
                            <ArrowRightIcon className="ml-1.5 w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    /* Step 2: Company Information */
                    <div className="space-y-3">
                        <div className="text-center mb-2">
                            <h3 className="text-sm font-semibold text-gray-800">Company Information</h3>
                        </div>

                        <div>
                            <label htmlFor="companyRole" className="block text-xs font-medium text-gray-700 mb-1">
                                Your Role
                            </label>
                            <select
                                id="companyRole"
                                name="companyRole"
                                required
                                value={formData.companyRole}
                                onChange={handleChange}
                                className="w-full px-2.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-xs"
                            >
                                {/* Role enum values must match backend: OWNER, MANAGER, EMPLOYEE */}
                                <option value="OWNER">Owner</option>
                                <option value="MANAGER">Manager</option>
                                <option value="EMPLOYEE">Employee</option>
                            </select>
                        </div>

                        {!isOwner ? (
                            <div className="space-y-2">
                                <div>
                                    <label htmlFor="companySearch" className="block text-xs font-medium text-gray-700 mb-1">
                                        Search Company {!formData.companyId && <span className="text-red-600">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        id="companySearch"
                                        value={companyQuery}
                                        onChange={(e) => {
                                            setCompanyQuery(e.target.value);
                                            setShowCompanyResults(true);
                                        }}
                                        onFocus={() => setShowCompanyResults(true)}
                                        required={!isOwner && !formData.companyId}
                                        className="w-full px-2.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-xs"
                                        placeholder="Search for your company..."
                                    />
                                </div>

                                {showCompanyResults && companyQuery.length > 2 && (
                                    <div className="relative">
                                        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-24 overflow-y-auto">
                                            {loadingCompanies ? (
                                                <div className="p-2 text-center text-gray-600 text-xs">Searching...</div>
                                            ) : companies.length === 0 ? (
                                                <div className="p-2 text-center text-gray-600 text-xs">No companies found</div>
                                            ) : (
                                                <ul>
                                                    {companies.map(company => (
                                                        <li
                                                            key={company.id}
                                                            className="px-2 py-1.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                                            onClick={() => handleCompanySelect(company)}
                                                        >
                                                            <div className="font-medium text-gray-900 text-xs">{company.name}</div>
                                                            <div className="text-xs text-gray-600 truncate">{company.address}</div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {formData.companyId && (
                                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                                        <div className="flex items-center">
                                            <CheckCircleIcon className="h-3 w-3 text-emerald-600 mr-1.5" />
                                            <div>
                                                <div className="font-medium text-gray-900 text-xs">Selected</div>
                                                <div className="font-semibold text-emerald-700 text-xs">{formData.companyName}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div>
                                    <label htmlFor="companyName" className="block text-xs font-medium text-gray-700 mb-1">
                                        Company Name
                                    </label>
                                    <input
                                        id="companyName"
                                        name="companyName"
                                        type="text"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-2.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-xs"
                                        placeholder="Your company name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="companyAddress" className="block text-xs font-medium text-gray-700 mb-1">
                                        Company Address
                                    </label>
                                    <input
                                        id="companyAddress"
                                        name="companyAddress"
                                        type="text"
                                        value={formData.companyAddress}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-2.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-xs"
                                        placeholder="123 Main St, City, State, ZIP"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="industry" className="block text-xs font-medium text-gray-700 mb-1">
                                        Industry
                                    </label>
                                    <input
                                        id="industry"
                                        name="industry"
                                        type="text"
                                        value={formData.industry}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-2.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-xs"
                                        placeholder="e.g., Technology, Manufacturing"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center text-sm"
                            >
                                <ArrowLeftIcon className="mr-1.5 w-3 h-3" />
                                <span>Back</span>
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading || !canSubmitForm()}
                                className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center text-sm"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    <span>Create Account</span>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}