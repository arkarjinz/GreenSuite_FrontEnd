"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { AuthUser } from '@/types/auth';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const pathname = usePathname();

    const hiddenPages = [
        '/login',
        '/register',
        '/forgot-password',
        '/security-questions',
        '/reset-password',
        '/pending'
    ];

    if (hiddenPages.includes(pathname)) return null;

    return (
        <nav className="bg-white shadow-sm fixed w-full z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center">
                            <span className="ml-2 text-xl font-bold text-gray-900">GreenSuite</span>
                        </Link>
                    </div>

                    {isAuthenticated ? (
                        <AuthenticatedNav user={user} logout={logout} />
                    ) : (
                        <UnauthenticatedNav />
                    )}
                </div>
            </div>
        </nav>
    );
};

const AuthenticatedNav = ({ user, logout }: { user: AuthUser | null; logout: () => void }) => (
    <div className="flex items-center">
        <div className="hidden md:flex items-center space-x-6 mr-8">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/carbon">Carbon Calculator</NavLink>
            <NavLink href="/reports">Reports</NavLink>
        </div>

        <div className="flex items-center space-x-4">
            <div className="relative group">
                <button className="flex items-center text-sm rounded-full focus:outline-none">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                    <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        {user?.companyName && (
                            <p className="text-xs text-gray-500 mt-1">{user.companyName}</p>
                        )}
                    </div>
                    <NavDropdownLink href="/profile">Your Profile</NavDropdownLink>
                    <NavDropdownLink href="/settings">Settings</NavDropdownLink>
                    <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const UnauthenticatedNav = () => (
    <div className="flex items-center">
        <div className="flex space-x-2">
            <Link href="/login">
                <Button variant="outline" size="md">Login</Button>
            </Link>
            <Link href="/register">
                <Button variant="primary" size="md">Get Started</Button>
            </Link>
        </div>
    </div>
);

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="text-gray-700 hover:text-green-600 px-3 py-2 font-medium">
        {children}
    </Link>
);

const NavDropdownLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        {children}
    </Link>
);

export default Navbar;