import { Link } from '@inertiajs/react';
import { register } from '@/routes';

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
            {/* Subtle background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-200/40 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-16">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-white/50 rounded-full px-4 py-2 text-sm text-gray-600 mb-8 shadow-sm">
                    <svg className="w-4 h-4 text-violet-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
                    </svg>
                    Your Journey to Global Education Starts Here
                </div>

                {/* Headline */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                    <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">
                        Find Your Dream
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
                        University
                    </span>
                </h1>

                {/* Subtext */}
                <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Discover, compare, and apply to top universities worldwide. Get personalized recommendations, track applications, and explore scholarships — all in one place.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href={register()}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl text-base font-semibold shadow-lg shadow-violet-200 transition-all hover:shadow-violet-300 hover:-translate-y-0.5 w-full sm:w-auto justify-center"
                    >
                        Get Started
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                    <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 px-8 py-4 rounded-2xl text-base font-semibold shadow-sm transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center">
                        Watch Demo
                    </button>
                </div>
            </div>
        </section>
    );
}
