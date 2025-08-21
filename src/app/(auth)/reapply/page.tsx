"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { authApi, companyApi } from '@/lib/api';
import { UserPlusIcon, ExclamationTriangleIcon, InformationCircleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

export default function ReapplyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [companies, setCompanies] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [token, setToken] = useState('');
    const [rejectionInfo, setRejectionInfo] = useState<{
        count: number;
        remaining: number;
        isApproachingBan: boolean;
    } | null>(null);

    const [formData, setFormData] = useState({
        companyName: '',
        companyRole: 'EMPLOYEE',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        // Get reapplication token from URL params or localStorage
        const urlToken = searchParams.get('token');
        const storedToken = localStorage.getItem('reapplicationToken');
        
        if (urlToken) {
            setToken(urlToken);
            localStorage.setItem('reapplicationToken', urlToken);
        } else if (storedToken) {
            setToken(storedToken);
        } else {
            setError('No reapplication token found. Please contact your company administrator.');
        }

        // Try to parse rejection info from token or localStorage
        const storedRejectionInfo = localStorage.getItem('rejectionInfo');
        if (storedRejectionInfo) {
            try {
                const info = JSON.parse(storedRejectionInfo);
                setRejectionInfo(info);
            } catch (error) {
                console.error('Failed to parse rejection info:', error);
            }
        }

        // Load companies
        loadCompanies();
    }, [searchParams]);

    const loadCompanies = async () => {
        try {
            const companiesData = await companyApi.getAllCompanies();
            setCompanies(companiesData);
        } catch (err) {
            console.error('Failed to load companies:', err);
        }
    };

    const searchCompanies = async (query: string) => {
        if (!query.trim()) {
            loadCompanies();
            return;
        }

        try {
            const results = await companyApi.searchCompanies(query);
            setCompanies(results);
        } catch (err) {
            console.error('Failed to search companies:', err);
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        searchCompanies(value);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError('');
    };

    const handleCompanySelect = (companyName: string) => {
        handleInputChange('companyName', companyName);
        setSearchQuery(companyName);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!token) {
            setError('No reapplication token available. Please contact support.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (!formData.companyName) {
            setError('Please select a company');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const reapplyData = {
                token: token,
                companyName: formData.companyName,
                companyRole: formData.companyRole,
                password: formData.password
            };

            const response = await authApi.reapply(reapplyData);
            
            setSuccess('Reapplication submitted successfully! Please wait for company approval.');
            
            // Clear the stored data
            localStorage.removeItem('reapplicationToken');
            localStorage.removeItem('rejectionInfo');
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login?message=reapplication-submitted');
            }, 3000);

        } catch (err: any) {
            console.error('Reapplication failed:', err);
            
            // Handle specific backend error responses
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.details) {
                // Handle validation errors with details
                const details = err.response.data.details;
                if (details.companyName) {
                    setError(`Company Error: ${details.companyName}`);
                } else if (details.solution) {
                    setError(`${err.response.data.message}: ${details.solution}`);
                } else {
                    setError(err.response.data.message);
                }
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Reapplication failed. Please try again or contact support.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!token && !error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <UserPlusIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Reapply for Access</h1>
                    <p className="text-gray-600">Submit a new application to join a different company</p>
                </div>

                {/* Rejection Status Warning */}
                {rejectionInfo && (
                    <div className={`mb-6 p-4 rounded-xl border-2 ${
                        rejectionInfo.isApproachingBan 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-yellow-50 border-yellow-200'
                    }`}>
                        <div className="flex items-start space-x-3">
                            <ShieldExclamationIcon className={`w-6 h-6 mt-0.5 flex-shrink-0 ${
                                rejectionInfo.isApproachingBan ? 'text-red-500' : 'text-yellow-500'
                            }`} />
                            <div>
                                <h3 className={`font-semibold mb-1 ${
                                    rejectionInfo.isApproachingBan ? 'text-red-800' : 'text-yellow-800'
                                }`}>
                                    {rejectionInfo.isApproachingBan ? 'FINAL WARNING' : 'Reapplication Notice'}
                                </h3>
                                <p className={`text-sm mb-2 ${
                                    rejectionInfo.isApproachingBan ? 'text-red-700' : 'text-yellow-700'
                                }`}>
                                    You have been rejected {rejectionInfo.count} time(s). 
                                    You have {rejectionInfo.remaining} attempt(s) remaining.
                                </p>
                                {rejectionInfo.isApproachingBan && (
                                    <p className="text-red-600 text-xs font-medium">
                                        ⚠️ If this application is rejected, your account will be permanently banned from the platform.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Error/Success Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-red-800 font-medium">Error</h3>
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
                        <InformationCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-green-800 font-medium">Success!</h3>
                            <p className="text-green-600 text-sm mt-1">{success}</p>
                        </div>
                    </div>
                )}

                {/* Important Information */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <h3 className="text-blue-800 font-medium mb-2">Important Guidelines</h3>
                    <ul className="text-blue-600 text-sm space-y-1">
                        <li>• You must apply to a <strong>different company</strong> than previously</li>
                        <li>• Companies that have rejected you before will not appear in search</li>
                        <li>• Set a new password for security purposes</li>
                        <li>• Ensure you meet the new company's requirements</li>
                        <li>• Wait for the company owner's approval decision</li>
                    </ul>
                </div>

                {/* Reapplication Form */}
                {!success && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                        {/* Company Selection */}
                        <div className="mb-6">
                            <FormField
                                label="Search and Select Company"
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Type to search companies..."
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Only companies that haven't previously rejected you will appear
                            </p>
                            
                            {companies.length > 0 && searchQuery && (
                                <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                                    {companies.map((company) => (
                                        <button
                                            key={company.id}
                                            type="button"
                                            onClick={() => handleCompanySelect(company.name)}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                        >
                                            <div className="font-medium text-gray-900">{company.name}</div>
                                            {company.industry && (
                                                <div className="text-sm text-gray-500">{company.industry}</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Company Role */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Role
                            </label>
                            <select
                                value={formData.companyRole}
                                onChange={(e) => handleInputChange('companyRole', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                required
                            >
                                <option value="EMPLOYEE">Employee</option>
                                <option value="MANAGER">Manager</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Note: Owner role requires separate company registration
                            </p>
                        </div>

                        {/* New Password */}
                        <div className="mb-6">
                            <FormField
                                label="New Password"
                                type="password"
                                value={formData.password}
                                onChange={(value) => handleInputChange('password', value)}
                                placeholder="Enter a new password (min. 6 characters)"
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-6">
                            <FormField
                                label="Confirm Password"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(value) => handleInputChange('confirmPassword', value)}
                                placeholder="Confirm your new password"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            loading={loading}
                        >
                            {loading ? 'Submitting Application...' : 'Submit Reapplication'}
                        </Button>

                        {/* Back to Login */}
                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
} 