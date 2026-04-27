import { Link } from '@inertiajs/react';
import { register } from '@/routes';

const benefits = [
    'Comprehensive database of 1000+ universities worldwide',
    'Real-time application tracking and deadline reminders',
    'Personalized scholarship recommendations',
    'Expert insights and university rankings',
    'Free to use with no hidden fees',
    '24/7 support to help you succeed',
];

function CheckIcon() {
    return (
        <svg className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

export default function WhyChooseSection() {
    return (
        <>
            {/* Why Choose UniSearch */}
            <section className="bg-gradient-to-br from-blue-500 via-violet-600 to-purple-500 py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Why Choose UniSearch?</h2>
                    <p className="text-white/70 text-lg mb-12">Join thousands of students who found their perfect university match</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {benefits.map((benefit) => (
                            <div
                                key={benefit}
                                className="flex items-start gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-4 text-left"
                            >
                                <CheckIcon />
                                <span className="text-sm text-white/90 leading-snug">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Card */}
            <section className="bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 px-8 py-12 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Ready to Start Your Journey?</h2>
                        <p className="text-gray-500 text-base mb-8">Join thousands of students finding their dream universities today</p>

                        <Link
                            href={register()}
                            className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-8 py-4 rounded-2xl text-base font-semibold shadow-lg shadow-violet-200 transition-all hover:shadow-violet-300 hover:-translate-y-0.5"
                        >
                            Get Started for Free
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>

                        <p className="text-xs text-gray-400 mt-4">No credit card required • Free forever</p>
                    </div>
                </div>
            </section>
        </>
    );
}
