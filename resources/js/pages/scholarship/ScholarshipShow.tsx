import { Head, Link, usePage } from '@inertiajs/react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface SubjectArea {
    name:  string;
    count?: number;
}

interface Scholarship {
    id:               number;
    name:             string;
    slug:             string;
    institution:      string;
    logo:             string | null;
    cover_image:      string | null;
    website:          string | null;
    country:          string | null;
    country_code:     string | null;
    type:             string;
    coverage_type:    string;
    currency:         string;
    currency_symbol:  string;
    monthly_amount:   number | null;
    tuition_coverage: number | null;
    travel_allowance: number | null;
    living_allowance: number | null;
    duration:         string | null;
    recipients:       number | null;
    description:      string | null;
    subject_areas:    (string | SubjectArea)[];
    is_published:     boolean;
}

interface PageProps {
    scholarship: Scholarship;
    [key: string]: unknown;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
    'Merit-Based':  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Need-Based':   'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'Government':   'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'Research':     'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'Athletic':     'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    'Other':        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }: {
    icon: React.ReactNode; label: string; value: string; color: string;
}) {
    const colorMap: Record<string, string> = {
        blue:    'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800',
        amber:   'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800',
        purple:  'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800',
        orange:  'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800',
        slate:   'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700',
    };

    const textMap: Record<string, string> = {
        blue:    'text-blue-700 dark:text-blue-300',
        emerald: 'text-emerald-700 dark:text-emerald-300',
        amber:   'text-amber-700 dark:text-amber-300',
        purple:  'text-purple-700 dark:text-purple-300',
        orange:  'text-orange-700 dark:text-orange-300',
        slate:   'text-slate-700 dark:text-slate-300',
    };

    return (
        <div className={`${colorMap[color]} border rounded-2xl p-5 flex flex-col items-center text-center`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${colorMap[color]} border`}>
                <span className={textMap[color]}>{icon}</span>
            </div>
            <p className={`text-[10px] uppercase tracking-wider mb-1 ${textMap[color]} opacity-70`}>{label}</p>
            <p className={`text-base font-bold ${textMap[color]}`}>{value}</p>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ScholarshipShow() {
    const { scholarship } = usePage<PageProps>().props;

    const typeColor = TYPE_COLORS[scholarship.type] ?? TYPE_COLORS['Other'];

    const financialStats = [
        {
            label: 'Monthly Stipend',
            value: scholarship.monthly_amount
                ? `${scholarship.currency_symbol}${Number(scholarship.monthly_amount).toLocaleString()}/mo`
                : 'N/A',
            color: 'blue',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            ),
        },
        {
            label: 'Tuition Coverage',
            value: scholarship.tuition_coverage !== null
                ? (scholarship.tuition_coverage === 0
                    ? 'Fully Covered'
                    : `${scholarship.currency_symbol}${Number(scholarship.tuition_coverage).toLocaleString()}`)
                : 'N/A',
            color: 'emerald',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 14l9-5-9-5-9 5 9 5z"/>
                </svg>
            ),
        },
        {
            label: 'Travel Allowance',
            value: scholarship.travel_allowance
                ? `${scholarship.currency_symbol}${Number(scholarship.travel_allowance).toLocaleString()}`
                : 'N/A',
            color: 'amber',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
                </svg>
            ),
        },
        {
            label: 'Living Allowance',
            value: scholarship.living_allowance
                ? `${scholarship.currency_symbol}${Number(scholarship.living_allowance).toLocaleString()}/mo`
                : 'N/A',
            color: 'purple',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
            ),
        },
        {
            label: 'Duration',
            value: scholarship.duration ?? 'N/A',
            color: 'orange',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            ),
        },
        {
            label: 'Recipients',
            value: scholarship.recipients
                ? scholarship.recipients.toLocaleString()
                : 'N/A',
            color: 'slate',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                </svg>
            ),
        },
    ];

    return (
        <>
            <Head title={scholarship.name} />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

                {/* ── Hero ── */}
                <div className="bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 dark:from-amber-900 dark:via-orange-900 dark:to-slate-900">

                    {/* Back */}
                    <div className="px-6 pt-5">
                        <Link href="/scholarships"
                            className="inline-flex items-center gap-2 text-amber-200 hover:text-white text-sm font-medium transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                            </svg>
                            Back to Scholarships
                        </Link>
                    </div>

                    <div className="px-6 sm:px-10 pt-6 pb-10">
                        <div className="flex flex-col sm:flex-row gap-6 items-start max-w-4xl">

                            {/* Cover image */}
                            {scholarship.cover_image && (
                                <div className="w-full sm:w-64 h-44 rounded-2xl overflow-hidden shrink-0 shadow-xl">
                                    <img src={scholarship.cover_image} alt={scholarship.name}
                                        className="w-full h-full object-cover"/>
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-start gap-4 mb-4">
                                    {scholarship.logo && (
                                        <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg bg-white shrink-0 flex items-center justify-center">
                                            <img src={scholarship.logo} alt="logo"
                                                className="w-12 h-12 object-contain"/>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-amber-200 text-sm font-semibold mb-1">{scholarship.institution}</p>
                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                                            {scholarship.name}
                                        </h1>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-5">
                                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-800/60 text-amber-100 border border-amber-700/50 backdrop-blur-sm">
                                        {scholarship.type}
                                    </span>
                                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                                        {scholarship.coverage_type}
                                    </span>
                                    {scholarship.country && (
                                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-sm flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                            </svg>
                                            {scholarship.country}
                                        </span>
                                    )}
                                    {scholarship.currency !== 'USD' && (
                                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                                            {scholarship.currency}
                                        </span>
                                    )}
                                </div>

                                {/* Quick stats */}
                                <div className="flex items-center gap-4 flex-wrap">
                                    {scholarship.monthly_amount && (
                                        <div className="text-white">
                                            <p className="text-[11px] text-amber-200 uppercase tracking-wider">Monthly Stipend</p>
                                            <p className="text-lg font-bold">
                                                {scholarship.currency_symbol}{Number(scholarship.monthly_amount).toLocaleString()}/mo
                                            </p>
                                        </div>
                                    )}
                                    {scholarship.duration && (
                                        <div className="text-white">
                                            <p className="text-[11px] text-amber-200 uppercase tracking-wider">Duration</p>
                                            <p className="text-lg font-bold">{scholarship.duration}</p>
                                        </div>
                                    )}
                                    {scholarship.recipients && (
                                        <div className="text-white">
                                            <p className="text-[11px] text-amber-200 uppercase tracking-wider">Recipients</p>
                                            <p className="text-lg font-bold">{scholarship.recipients.toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="max-w-4xl mx-auto px-6 sm:px-10 py-8 space-y-6">

                    {/* Description */}
                    {scholarship.description && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                About this Scholarship
                            </h2>
                            <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                {scholarship.description}
                            </p>
                        </div>
                    )}

                    {/* Financial breakdown */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-5">
                            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Financial Benefits
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {financialStats.map(s => (
                                <StatCard key={s.label} {...s} />
                            ))}
                        </div>
                    </div>

                    {/* Subject areas */}
                    {scholarship.subject_areas && scholarship.subject_areas.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                </svg>
                                Eligible Fields / Subjects
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {scholarship.subject_areas.map((area, i) => {
                                    const name  = typeof area === 'object' ? area.name  : area;
                                    const count = typeof area === 'object' ? area.count : undefined;
                                    return (
                                        <div key={i}
                                            className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl px-3 py-1.5">
                                            <span className="text-[13px] font-semibold text-amber-700 dark:text-amber-300">{name}</span>
                                            {count !== undefined && (
                                                <span className="text-[11px] text-amber-500 dark:text-amber-400 font-medium">
                                                    ({count})
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-800 dark:to-orange-900 rounded-2xl p-6 text-center shadow-lg">
                        <h2 className="text-xl font-extrabold text-white mb-2">Ready to Apply?</h2>
                        <p className="text-amber-100 text-sm mb-5">
                            Visit the official scholarship page to check eligibility and start your application.
                        </p>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            {scholarship.website && (
                                <a href={scholarship.website} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-white hover:bg-amber-50 text-amber-700 font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-md">
                                    Visit Official Website
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                    </svg>
                                </a>
                            )}
                            <Link href="/scholarships"
                                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm border border-white/30">
                                Browse More
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
