import { useState } from 'react';
import { Link } from '@inertiajs/react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ScholarshipListItem {
    id: number;
    name: string;
    slug: string;
    institution: string;
    logo: string | null;
    cover_image: string | null;
    website: string | null;
    country: string | null;
    country_code: string | null;
    type: string;
    coverage_type: string;
    currency: string;
    currency_symbol: string;
    monthly_amount: number | null;
    tuition_coverage: number | null;
    travel_allowance: number | null;
    living_allowance: number | null;
    duration: string | null;
    recipients: number | null;
    description: string | null;
    subject_areas: { name: string; count: number }[];
}

interface Props {
    scholarship: ScholarshipListItem;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

type CardTab = 'Programs' | 'Financial' | 'Coverage';

const TABS: CardTab[] = ['Programs', 'Financial', 'Coverage'];

const SUBJECT_COLORS = [
    { bg: 'bg-blue-50 dark:bg-blue-950/40',    text: 'text-blue-700 dark:text-blue-300',    num: 'text-blue-600 dark:text-blue-400' },
    { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', num: 'text-emerald-600 dark:text-emerald-400' },
    { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-300', num: 'text-violet-600 dark:text-violet-400' },
    { bg: 'bg-amber-50 dark:bg-amber-950/40',   text: 'text-amber-700 dark:text-amber-300',   num: 'text-amber-600 dark:text-amber-400' },
    { bg: 'bg-rose-50 dark:bg-rose-950/40',     text: 'text-rose-700 dark:text-rose-300',     num: 'text-rose-600 dark:text-rose-400' },
    { bg: 'bg-cyan-50 dark:bg-cyan-950/40',     text: 'text-cyan-700 dark:text-cyan-300',     num: 'text-cyan-600 dark:text-cyan-400' },
];

const COVERAGE_COLORS: Record<string, string> = {
    'Fully Funded':    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'Full Ride':       'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'Partial':         'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'Tuition Only':    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'Living Expenses': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const TYPE_COLORS: Record<string, string> = {
    'Merit-Based':  'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'Need-Based':   'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Research':     'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    'Government':   'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    'Athletic':     'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'Other':        'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmt(symbol: string, val: number | null, suffix = ''): string {
    if (val === null) return '—';
    return `${symbol}${val.toLocaleString()}${suffix}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Programs tab — subject area boxes with +N more */
function ProgramsTab({ subjects }: { subjects: { name: string; count: number }[] }) {
    if (subjects.length === 0) {
        return (
            <p className="text-[12.5px] text-zinc-400 dark:text-zinc-500 italic py-2">
                No subject areas listed
            </p>
        );
    }

    const visible  = subjects.slice(0, 3);
    const overflow = subjects.length - 3;

    return (
        <div className="flex gap-2 flex-wrap">
            {visible.map((s, i) => {
                const c = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
                return (
                    <div
                        key={s.name}
                        className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2.5 rounded-xl border border-transparent min-w-[90px] ${c.bg}`}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={c.text}>
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={`text-[10.5px] font-medium text-center leading-tight ${c.text} opacity-70`}>
                            {s.name}
                        </span>
                        <span className={`text-[15px] font-bold leading-tight ${c.num}`}>
                            {s.count}
                        </span>
                    </div>
                );
            })}
            {overflow > 0 && (
                <div className="flex flex-col items-center justify-center gap-0.5 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 min-w-[60px]">
                    <span className="text-[15px] font-bold text-zinc-500 dark:text-zinc-400">+{overflow}</span>
                    <span className="text-[10.5px] text-zinc-400 dark:text-zinc-500">more</span>
                </div>
            )}
        </div>
    );
}

/** Financial tab — key financial figures */
function FinancialTab({ s }: { s: ScholarshipListItem }) {
    const sym = s.currency_symbol;
    const rows = [
        { label: 'Monthly Stipend', value: fmt(sym, s.monthly_amount, '/mo') },
        { label: 'Tuition',         value: fmt(sym, s.tuition_coverage) },
        { label: 'Travel Allowance',value: fmt(sym, s.travel_allowance) },
        { label: 'Living Allowance',value: fmt(sym, s.living_allowance, '/mo') },
    ].filter((r) => r.value !== '—');

    if (rows.length === 0) {
        return <p className="text-[12.5px] text-zinc-400 dark:text-zinc-500 italic py-2">No financial details listed</p>;
    }

    return (
        <div className="flex gap-4 flex-wrap">
            {rows.map((r) => (
                <div key={r.label} className="flex flex-col gap-0.5">
                    <span className="text-[10.5px] text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wide">
                        {r.label}
                    </span>
                    <span className="text-[14px] font-bold text-[#1a6b8a] dark:text-[#3a9bbf]">
                        {r.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

/** Coverage tab — type + coverage_type badges + duration */
function CoverageTab({ s }: { s: ScholarshipListItem }) {
    return (
        <div className="flex items-center gap-2 flex-wrap py-1">
            <span className={`text-[12px] font-semibold px-3 py-1.5 rounded-full ${TYPE_COLORS[s.type] ?? TYPE_COLORS['Other']}`}>
                {s.type}
            </span>
            <span className={`text-[12px] font-semibold px-3 py-1.5 rounded-full ${COVERAGE_COLORS[s.coverage_type] ?? ''}`}>
                {s.coverage_type}
            </span>
            {s.duration && (
                <span className="flex items-center gap-1.5 text-[12px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {s.duration}
                </span>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main card
// ─────────────────────────────────────────────────────────────────────────────

export default function ScholarshipCard({ scholarship: s }: Props) {
    const [activeTab, setActiveTab]   = useState<CardTab>('Programs');
    const [imgError, setImgError]     = useState(false);
    const [logoError, setLogoError]   = useState(false);

    const hasCover = !!(s.cover_image && !imgError);
    const hasLogo  = !!(s.logo && !logoError);

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">

            {/* ── Left: Cover image ── */}
            <div className="w-44 sm:w-52 shrink-0 relative overflow-hidden">
                {hasCover ? (
                    <img
                        src={s.cover_image!}
                        alt={s.name}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1a6b8a] to-[#0f4a6a] flex items-center justify-center">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-white/30">
                            <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                    </div>
                )}
            </div>

            {/* ── Right: Content ── */}
            <div className="flex-1 min-w-0 p-5 flex flex-col gap-3">

                {/* Row 1: Logo + Name + Website + Bookmark */}
                <div className="flex items-start gap-3">
                    {/* Logo circle */}
                    <div className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-800 shrink-0 shadow-sm">
                        {hasLogo ? (
                            <img
                                src={s.logo!}
                                alt={s.institution}
                                className="w-full h-full object-cover"
                                onError={() => setLogoError(true)}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#1a6b8a] to-[#0f4a6a] flex items-center justify-center">
                                <span className="text-white text-[11px] font-black">
                                    {s.institution.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-bold text-zinc-800 dark:text-zinc-100 leading-snug truncate">
                            {s.name}
                        </h3>
                    </div>

                    {/* Website button */}
                    {s.website && (
                        <a
                            href={s.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-[#1a6b8a] dark:hover:text-[#3a9bbf] border border-zinc-200 dark:border-zinc-700 hover:border-[#1a6b8a]/40 rounded-lg px-2.5 py-1.5 transition-all shrink-0 no-underline"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                                <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            Website
                        </a>
                    )}

                    {/* Bookmark icon */}
                    <button
                        title="Save scholarship"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-[#1a6b8a] dark:hover:text-[#3a9bbf] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shrink-0"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Row 2: Location */}
                {s.country && (
                    <div className="flex items-center gap-1.5 text-[12.5px] text-zinc-500 dark:text-zinc-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {s.country}
                    </div>
                )}

                {/* Row 3: Institution badge + Recipients badge */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#1a6b8a] dark:text-[#3a9bbf] bg-[#1a6b8a]/8 dark:bg-[#1a6b8a]/20 border border-[#1a6b8a]/20 dark:border-[#1a6b8a]/30 px-2.5 py-1 rounded-lg">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.87L12 17.77l-6.18 3.24L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        </svg>
                        {s.institution}
                    </span>

                    {s.recipients != null && (
                        <span className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded-lg">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {s.recipients.toLocaleString()} Recipients
                        </span>
                    )}
                </div>

                {/* Row 4: Mini tab switcher */}
                <div className="flex items-center gap-0 border-b border-zinc-100 dark:border-zinc-800">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-2 text-[12.5px] font-medium transition-all duration-150 border-b-2 -mb-px ${
                                activeTab === tab
                                    ? 'border-[#1a6b8a] text-[#1a6b8a] dark:text-[#3a9bbf] dark:border-[#3a9bbf]'
                                    : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Row 5: Tab content */}
                <div className="min-h-[60px]">
                    {activeTab === 'Programs'  && <ProgramsTab subjects={s.subject_areas} />}
                    {activeTab === 'Financial' && <FinancialTab s={s} />}
                    {activeTab === 'Coverage'  && <CoverageTab s={s} />}
                </div>

                {/* Row 6: View Details button */}
                <div className="flex justify-end mt-auto pt-1">
                    <Link
                        href={`/scholarships/${s.slug}`}
                        className="flex items-center gap-2 bg-[#1a6b8a] hover:bg-[#155878] text-white text-[13px] font-semibold px-5 py-2 rounded-xl transition-all no-underline shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0"
                    >
                        View Details
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
