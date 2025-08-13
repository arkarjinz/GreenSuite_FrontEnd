"use client"
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { AuthUser } from '@/types/auth';
import { useState, useEffect } from 'react';
import { 
    HomeIcon, 
    UserIcon, 
    ChatBubbleLeftRightIcon, 
    CalculatorIcon, 
    DocumentChartBarIcon, 
    UsersIcon, 
    XMarkIcon, 
    Bars3Icon,
    SparklesIcon,
    GlobeAltIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    AcademicCapIcon,
    CreditCardIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [isClient, setIsClient] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Set isClient to true after component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Show minimal navbar during initial load
    if (!isClient || isLoading) {
        return (
            <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-emerald-100 relative z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity group">
                                <div className="relative">
                                    <GlobeAltIcon className="w-8 h-8 text-emerald-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    GreenSuite
                                </span>
                            </Link>
                        </div>
                        <div className="w-8 h-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-600"></div>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled 
                    ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-emerald-100' 
                    : 'bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-50'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                    <div className="flex items-center">
                            <Link href="/" className="flex items-center hover:opacity-80 transition-all duration-300 group">
                                <div className="relative">
                                    <GlobeAltIcon className="w-6 h-6 text-emerald-600 mr-2 group-hover:scale-110 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                                </div>
                                <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                GreenSuite
                            </span>
                                <SparklesIcon className="w-4 h-4 text-emerald-500 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-pulse" />
                        </Link>
                    </div>

                        {/* Desktop Navigation */}
                    {isAuthenticated && user ? (
                        <AuthenticatedNav user={user} logout={logout} />
                    ) : (
                        <UnauthenticatedNav />
                        )}

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors duration-200"
                            >
                                {isMobileMenuOpen ? (
                                    <XMarkIcon className="w-6 h-6 text-emerald-600" />
                                ) : (
                                    <Bars3Icon className="w-6 h-6 text-emerald-600" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-lg">
                        <div className="px-4 py-6 space-y-4">
                            {isAuthenticated && user ? (
                                <MobileAuthenticatedNav user={user} logout={logout} onClose={() => setIsMobileMenuOpen(false)} />
                            ) : (
                                <MobileUnauthenticatedNav onClose={() => setIsMobileMenuOpen(false)} />
                    )}
                </div>
            </div>
                )}
        </nav>
            
            {/* Spacer to prevent content from hiding under fixed navbar */}
            <div className="h-16"></div>
        </>
    );
};

const NavLink = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon?: any }) => (
    <Link
        href={href}
        className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:bg-emerald-50 group relative"
    >
        {Icon && <Icon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" />}
        <span>{children}</span>
        <div className="absolute inset-0 bg-emerald-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
    </Link>
);

const AuthenticatedNav = ({ user, logout }: { user: AuthUser | null; logout: () => void }) => (
    <div className="hidden md:flex items-center space-x-6">
        {/* Navigation Links */}
        <div className="flex items-center space-x-2">
            <NavLink href="/dashboard" icon={HomeIcon}>Dashboard</NavLink>
                                    <NavLink href="/ai-chat/landing" icon={SparklesIcon}>Meet Rin</NavLink>
            <NavLink href="/ai-chat" icon={ChatBubbleLeftRightIcon}>AI Assistant</NavLink>
            <NavLink href="/credits" icon={CreditCardIcon}>Credits</NavLink>
            <NavLink href="/payment" icon={CreditCardIcon}>Payment</NavLink>
            <NavLink href="/carbon" icon={CalculatorIcon}>Carbon Calculator</NavLink>
            <NavLink href="/reports" icon={DocumentChartBarIcon}>Reports</NavLink>
            {user?.companyRole === 'OWNER' && (
                <>
                    <NavLink href="/dashboard/owner/users" icon={UsersIcon}>Manage Users</NavLink>
                    <NavLink href="/dashboard/owner/rejected" icon={Cog6ToothIcon}>Rejected Users</NavLink>
                    <NavLink href="/dashboard/owner/payment" icon={CreditCardIcon}>Payment Admin</NavLink>
                </>
            )}
        </div>

        {/* User Profile Section */}
        <div className="flex items-center space-x-4 pl-6 border-l border-emerald-200">
            {/* User Info */}
            <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2 rounded-xl border border-emerald-100">
                    <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                        <UserIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="text-xs">
                        <div className="font-medium text-gray-900">Welcome, {user?.firstName || 'User'}</div>
                        <div className="text-xs text-emerald-600 flex items-center">
                            <AcademicCapIcon className="w-2.5 h-2.5 mr-1" />
                            {user?.companyRole || 'User'}
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                <Button
                    onClick={logout}
                    variant="outline"
                    size="sm"
                    className="text-gray-700 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-200 flex items-center space-x-2 text-xs px-3 py-1.5"
                >
                    <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
                    <span>Logout</span>
                </Button>
            </div>
        </div>
    </div>
);

const UnauthenticatedNav = () => (
    <div className="hidden md:flex items-center space-x-4">
        <Link
            href="/login"
            className="text-gray-700 hover:text-emerald-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-emerald-50 flex items-center space-x-2 group"
        >
            <UserIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            <span>Sign In</span>
        </Link>
        <Link
            href="/register"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 group"
        >
            <SparklesIcon className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
            <span>Get Started</span>
        </Link>
    </div>
);

const MobileAuthenticatedNav = ({ user, logout, onClose }: { user: AuthUser | null; logout: () => void; onClose: () => void }) => (
    <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                        <MobileNavLink href="/dashboard" icon={HomeIcon} onClick={onClose}>Dashboard</MobileNavLink>
                        <MobileNavLink href="/ai-chat/landing" icon={SparklesIcon} onClick={onClose}>Meet Rin</MobileNavLink>
                        <MobileNavLink href="/ai-chat" icon={ChatBubbleLeftRightIcon} onClick={onClose}>AI Assistant</MobileNavLink>
                        <MobileNavLink href="/credits" icon={CreditCardIcon} onClick={onClose}>Credits</MobileNavLink>
                        <MobileNavLink href="/payment" icon={CreditCardIcon} onClick={onClose}>Payment</MobileNavLink>
                        <MobileNavLink href="/carbon" icon={CalculatorIcon} onClick={onClose}>Carbon Calculator</MobileNavLink>
                        <MobileNavLink href="/reports" icon={DocumentChartBarIcon} onClick={onClose}>Reports</MobileNavLink>
                        {user?.companyRole === 'OWNER' && (
                            <>
                                <MobileNavLink href="/dashboard/owner/users" icon={UsersIcon} onClick={onClose}>Manage Users</MobileNavLink>
                                <MobileNavLink href="/dashboard/owner/rejected" icon={Cog6ToothIcon} onClick={onClose}>Rejected Users</MobileNavLink>
                                <MobileNavLink href="/dashboard/owner/payment" icon={CreditCardIcon} onClick={onClose}>Payment Admin</MobileNavLink>
                            </>
                        )}
                    </div>

        {/* User Profile Section */}
        <div className="pt-4 border-t border-emerald-200">
            <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <div className="font-semibold text-gray-900">Welcome, {user?.firstName || 'User'}</div>
                    <div className="text-sm text-emerald-600 flex items-center">
                        <AcademicCapIcon className="w-4 h-4 mr-1" />
                        {user?.companyRole || 'User'}
                    </div>
                </div>
            </div>
            
            <Button
                onClick={() => { logout(); onClose(); }}
                variant="outline"
                size="sm"
                className="w-full text-gray-700 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-200 flex items-center justify-center space-x-2"
            >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Logout</span>
            </Button>
        </div>
    </div>
);

const MobileUnauthenticatedNav = ({ onClose }: { onClose: () => void }) => (
    <div className="space-y-4">
        <Link
            href="/login"
            onClick={onClose}
            className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-gray-700 hover:text-emerald-600 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-emerald-50"
        >
            <UserIcon className="w-5 h-5" />
            <span>Sign In</span>
        </Link>
        <Link
            href="/register"
            onClick={onClose}
            className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
            <SparklesIcon className="w-5 h-5" />
            <span>Get Started</span>
        </Link>
    </div>
);

const MobileNavLink = ({ href, children, icon: Icon, onClick }: { href: string; children: React.ReactNode; icon?: any; onClick: () => void }) => (
    <Link
        href={href}
        onClick={onClick}
        className="flex flex-col items-center space-y-2 p-4 text-gray-700 hover:text-emerald-600 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-emerald-50 group"
    >
        {Icon && <Icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />}
        <span className="text-xs text-center">{children}</span>
    </Link>
);

export default Navbar;