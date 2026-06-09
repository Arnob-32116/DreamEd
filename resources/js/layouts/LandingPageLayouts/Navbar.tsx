import { Link } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { usePage } from '@inertiajs/react';
import type { Auth } from '@/types/auth';

interface NavbarProps {
    isAuthenticated: boolean;
    canRegister?: boolean;
}

interface SharedData {
    auth: Auth;
    name: string;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export default function Navbar({ isAuthenticated, canRegister = true }: NavbarProps) {
    // Moved inside the component body!
    const { auth } = usePage<SharedData>().props;
    const role = auth?.user?.role as string;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold text-violet-700">UniSearch</span>
                    </div>

                    {/* Nav Actions */}
                    <nav className="flex items-center gap-3">
                        {isAuthenticated ? (
                              <Link
                                    href={role === 'contributor' || role === 'admin' ? '/contributor/universities' : '/universities'}
                                    className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                                >
                                {role === 'contributor' || role === 'admin' ? 'My Universities' : 'Universities'}
                                </Link>
                            ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="text-sm font-medium text-gray-600 hover:text-violet-700 px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}