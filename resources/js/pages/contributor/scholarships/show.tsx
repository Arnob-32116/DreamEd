import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SubjectArea {
    name: string;
    count: number;
}

interface Scholarship {
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
    subject_areas: SubjectArea[];
    created_at: string;
}

interface PageProps {
    scholarship: Scholarship;
    [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SUBJECT_COLORS = [
    {
        bg:   'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-600 dark:text-blue-400',
        num:  'text-blue-700 dark:text-blue-300',
        border: 'border-blue-100 dark:border-blue-900/40',
    },
    {
        bg:   'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-600 dark:text-emerald-400',
        num:  'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-100 dark:border-emerald-900/40',
    },
    {
        bg:   'bg-violet-50 dark:bg-violet-950/40',
        text: 'text-violet-600 dark:text-violet-400',
        num:  'text-violet-700 dark:text-violet-300',
        border: 'border-violet-100 dark:border-violet-900/40',
    },
    {
        bg:   'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-600 dark:text-amber-400',
        num:  'text-amber-700 dark:text-amber-300',
        border: 'border-amber-100 dark:border-amber-900/40',
    },
    {
        bg:   'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-600 dark:text-rose-400',
        num:  'text-rose-700 dark:text-rose-300',
        border: 'border-rose-100 dark:border-rose-900/40',
    },
    {
        bg:   'bg-cyan-50 dark:bg-cyan-950/40',
        text: 'text-cyan-600 dark:text-cyan-400',
        num:  'text-cyan-700 dark:text-cyan-300',
        border: 'border-cyan-100 dark:border-cyan-900/40',
    },
];

// The 4 financial coverage boxes — icon color + background matching screenshot 2
const FINANCIAL_BOXES = [
    {
        key:   'coverage_type' as const,
        label: 'Type',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        iconBg:   'bg-emerald-500',
        cardBg:   'bg-emerald-50 dark:bg-emerald-950/30',
        textColor:'text-emerald-800 dark:text-emerald-200',
    },
    {
        key:   'tuition_coverage' as const,
        label: 'Tuition',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        iconBg:   'bg-blue-500',
        cardBg:   'bg-blue-50 dark:bg-blue-950/30',
        textColor:'text-blue-800 dark:text-blue-200',
    },
    {
        key:   'travel_allowance' as const,
        label: 'Travel',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
        iconBg:   'bg-violet-500',
        cardBg:   'bg-violet-50 dark:bg-violet-950/30',
        textColor:'text-violet-800 dark:text-violet-200',
    },
    {
        key:   'living_allowance' as const,
        label: 'Living',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2" />
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
        iconBg:   'bg-orange-500',
        cardBg:   'bg-orange-50 dark:bg-orange-950/30',
        textColor:'text-orange-800 dark:text-orange-200',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmt(symbol: string, val: number | null, suffix = ''): string {
    if (val === null || val === undefined) return '—';
    return `${symbol}${val.toLocaleString()}${suffix}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────────────────────────

function Section({
    icon,
    title,
    subtitle,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-1">
                <span className="text-[#1a6b8a] dark:text-[#3a9bbf]">{icon}</span>
                <h2 className="text-[17px] font-bold text-zinc-800 dark:text-zinc-100">{title}</h2>
            </div>
            {subtitle && (
                <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 mb-5 ml-8">{subtitle}</p>
            )}
            <div className="mt-4">{children}</div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function ScholarshipShow() {
    const { scholarship: s } = usePage<PageProps>().props;
    const [logoError, setLogoError] = useState(false);

    const sym = s.currency_symbol;

    return (
        <>
            <Head title={s.name} />

            <div className="flex-1 min-h-screen bg-[#f3f4f6] dark:bg-zinc-950 overflow-y-auto">

                {/* ── Hero — blue gradient header (Image 3) ── */}
                <div className="bg-gradient-to-br from-[#2a7fa0] to-[#1a5570] dark:from-[#1a5570] dark:to-[#0f3a50] px-6 sm:px-10 py-10">

                    {/* Back link */}
                    <Link
                        href="/scholarships"
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-[13.5px] font-medium mb-8 transition-colors no-underline group"
                    >
                        <svg
                            width="16" height="16" viewBox="0 0 24 24" fill="none"
                            className="transition-transform duration-200 group-hover:-translate-x-0.5"
                        >
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back to Scholarships
                    </Link>

                    {/* Hero body: logo image + info */}
                    <div className="flex flex-col sm:flex-row items-start gap-7 max-w-4xl">

                        {/* Logo / image box */}
                        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-white/10 border border-white/20 overflow-hidden shrink-0 shadow-xl">
                            {s.logo && !logoError ? (
                                <img
                                    src={s.logo}
                                    alt={s.institution}
                                    className="w-full h-full object-cover"
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-white/30">
                                        <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Text info */}
                        <div className="flex flex-col gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-1">
                                    {s.name}
                                </h1>
                                <p className="text-white/70 text-[15px] font-medium">
                                    {s.institution}
                                </p>
                            </div>

                            {/* Stat pills: amount / duration / recipients */}
                            <div className="flex flex-wrap gap-2">
                                {s.monthly_amount != null && (
                                    <span className="bg-white/15 border border-white/20 text-white text-[13px] font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm">
                                        {sym}{s.monthly_amount.toLocaleString()}/month
                                    </span>
                                )}
                                {s.duration && (
                                    <span className="bg-white/15 border border-white/20 text-white text-[13px] font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm">
                                        {s.duration}
                                    </span>
                                )}
                                {s.recipients != null && (
                                    <span className="bg-white/15 border border-white/20 text-white text-[13px] font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm">
                                        {s.recipients.toLocaleString()} Recipients
                                    </span>
                                )}
                            </div>

                            {/* Location + Website row */}
                            <div className="flex flex-wrap items-center gap-6">
                                {s.country && (
                                    <span className="flex items-center gap-2 text-white/80 text-[13.5px]">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" />
                                            <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                        {s.country}
                                    </span>
                                )}
                                {s.website && (
                                    <a
                                        href={s.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-white/80 hover:text-white text-[13.5px] transition-colors no-underline"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                                            <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                        Visit Website
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Body sections ── */}
                <div className="max-w-4xl mx-auto px-5 sm:px-6 py-8 flex flex-col gap-5">

                    {/* About */}
                    {s.description && (
                        <Section
                            icon={
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
                                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                </svg>
                            }
                            title="About This Scholarship"
                        >
                            <p className="text-[14.5px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                {s.description}
                            </p>
                        </Section>
                    )}

                    {/* Financial Coverage — 4 coloured boxes (Image 2) */}
                    {(s.tuition_coverage !== null || s.travel_allowance !== null || s.living_allowance !== null || s.coverage_type) && (
                        <Section
                            icon={
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            }
                            title="Financial Coverage"
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {FINANCIAL_BOXES.map((box) => {
                                    let display: string;
                                    if (box.key === 'coverage_type') {
                                        display = s.coverage_type;
                                    } else {
                                        const val = s[box.key] as number | null;
                                        display = val === 0
                                            ? `${sym}0`
                                            : fmt(sym, val, box.key === 'living_allowance' ? '/mo' : '');
                                    }

                                    return (
                                        <div
                                            key={box.key}
                                            className={`${box.cardBg} rounded-xl p-4 flex flex-col gap-3`}
                                        >
                                            <div className={`w-9 h-9 rounded-full ${box.iconBg} flex items-center justify-center text-white`}>
                                                {box.icon}
                                            </div>
                                            <div>
                                                <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${box.textColor} opacity-70`}>
                                                    {box.label}
                                                </p>
                                                <p className={`text-[17px] font-bold ${box.textColor}`}>
                                                    {display}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Section>
                    )}

                    {/* Programs Offered — subject area grid (Image 2) */}
                    {s.subject_areas.length > 0 && (
                        <Section
                            icon={
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            }
                            title="Programs Offered"
                            subtitle="Number of scholarship opportunities available in each field"
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                {s.subject_areas.map((subject, i) => {
                                    const c = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
                                    return (
                                        <div
                                            key={subject.name}
                                            className={`${c.bg} border ${c.border} rounded-xl p-4 flex flex-col items-center gap-2 text-center`}
                                        >
                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${c.text} leading-tight`}>
                                                {subject.name}
                                            </p>
                                            <p className={`text-[26px] font-bold leading-none ${c.num}`}>
                                                {subject.count}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </Section>
                    )}

                    {/* Key Information — recipients / duration / monthly (Image 1) */}
                    {(s.recipients != null || s.duration || s.monthly_amount != null) && (
                        <Section
                            icon={
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            }
                            title="Key Information"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                {/* Recipients */}
                                {s.recipients != null && (
                                    <KeyInfoStat
                                        icon={
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                                                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        }
                                        label="Total Recipients"
                                        value={`${s.recipients.toLocaleString()} students`}
                                    />
                                )}

                                {/* Duration */}
                                {s.duration && (
                                    <KeyInfoStat
                                        icon={
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                                                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        }
                                        label="Duration"
                                        value={s.duration}
                                    />
                                )}

                                {/* Monthly amount */}
                                {s.monthly_amount != null && (
                                    <KeyInfoStat
                                        icon={
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        }
                                        label="Monthly Amount"
                                        value={`${sym}${s.monthly_amount.toLocaleString()}/month`}
                                    />
                                )}
                            </div>
                        </Section>
                    )}

                    {/* Ready to Apply CTA (Image 1) */}
                    {s.website && (
                        <div className="bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center">
                            <h3 className="text-[17px] font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                                Ready to Apply?
                            </h3>
                            <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
                                Visit the official website to learn more about application requirements and deadlines
                            </p>
                            <a
                                href={s.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 bg-[#1a6b8a] hover:bg-[#155878] text-white font-semibold text-[14.5px] px-8 py-3.5 rounded-xl transition-all no-underline shadow-md hover:shadow-lg hover:-translate-y-px active:translate-y-0"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                                    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                Visit Official Website
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Key info stat block
// ─────────────────────────────────────────────────────────────────────────────

function KeyInfoStat({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-[#1a6b8a]/10 dark:bg-[#1a6b8a]/20 flex items-center justify-center text-[#1a6b8a] dark:text-[#3a9bbf] shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-[12px] text-zinc-400 dark:text-zinc-500 font-medium mb-0.5">{label}</p>
                <p className="text-[15px] font-bold text-zinc-800 dark:text-zinc-100">{value}</p>
            </div>
        </div>
    );
}