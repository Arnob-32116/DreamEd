import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ScholarshipItem {
    id: number;
    name: string;
    slug: string;
    institution: string;
    logo: string | null;
    cover_image: string | null;
    country: string | null;
    type: string;
    coverage_type: string;
    currency_symbol: string;
    monthly_amount: number | null;
    recipients: number | null;
    duration: string | null;
    subject_areas: { name: string; count: number }[];
    is_published: boolean;
    created_at: string;
}

interface PageProps {
    scholarships: ScholarshipItem[];
    [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    'Merit-Based': { bg: 'bg-amber-100 dark:bg-amber-900/30',   text: 'text-amber-700 dark:text-amber-300' },
    'Need-Based':  { bg: 'bg-blue-100 dark:bg-blue-900/30',     text: 'text-blue-700 dark:text-blue-300' },
    'Research':    { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300' },
    'Government':  { bg: 'bg-rose-100 dark:bg-rose-900/30',     text: 'text-rose-700 dark:text-rose-300' },
    'Athletic':    { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    'Other':       { bg: 'bg-zinc-100 dark:bg-zinc-800',        text: 'text-zinc-600 dark:text-zinc-400' },
};

const COVERAGE_COLORS: Record<string, { bg: string; text: string }> = {
    'Fully Funded':    { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    'Full Ride':       { bg: 'bg-violet-100 dark:bg-violet-900/30',   text: 'text-violet-700 dark:text-violet-300' },
    'Partial':         { bg: 'bg-blue-100 dark:bg-blue-900/30',       text: 'text-blue-700 dark:text-blue-300' },
    'Tuition Only':    { bg: 'bg-amber-100 dark:bg-amber-900/30',     text: 'text-amber-700 dark:text-amber-300' },
    'Living Expenses': { bg: 'bg-rose-100 dark:bg-rose-900/30',       text: 'text-rose-700 dark:text-rose-300' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete modal
// ─────────────────────────────────────────────────────────────────────────────

function DeleteModal({
    scholarship,
    onCancel,
}: {
    scholarship: ScholarshipItem;
    onCancel: () => void;
}) {
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        router.delete(`/contributor/scholarships/${scholarship.id}`, {
            onSuccess: () => { setDeleting(false); onCancel(); },
            onError:   () => setDeleting(false),
            onFinish:  () => setDeleting(false),
        });
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onCancel()}
        >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 w-full max-w-sm p-6">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-red-500">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <h3 className="text-[17px] font-bold text-zinc-800 dark:text-zinc-100 text-center mb-1">
                    Delete Scholarship?
                </h3>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 text-center leading-relaxed mb-6">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{scholarship.name}</span>
                    {' '}will be permanently removed along with its images.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[13.5px] font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl text-[13.5px] font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
                    >
                        {deleting ? 'Deleting…' : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scholarship row card
// ─────────────────────────────────────────────────────────────────────────────

function ScholarshipRow({
    scholarship: s,
    onDelete,
}: {
    scholarship: ScholarshipItem;
    onDelete: (s: ScholarshipItem) => void;
}) {
    const [imgError, setImgError]   = useState(false);
    const [logoError, setLogoError] = useState(false);

    const typeMeta     = TYPE_COLORS[s.type]          ?? TYPE_COLORS['Other'];
    const coverageMeta = COVERAGE_COLORS[s.coverage_type] ?? COVERAGE_COLORS['Partial'];
    const hasLogo      = !!(s.logo && !logoError);

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all duration-200">

            {/* Cover strip */}
            <div className="w-2 shrink-0 bg-gradient-to-b from-[#2a7fa0] to-[#1a5570]" />

            {/* Content */}
            <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">

                {/* Logo + name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl border border-zinc-100 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-800 shrink-0">
                        {hasLogo ? (
                            <img
                                src={s.logo!}
                                alt={s.institution}
                                className="w-full h-full object-cover"
                                onError={() => setLogoError(true)}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#2a7fa0] to-[#1a5570] flex items-center justify-center">
                                <span className="text-white text-[13px] font-black">
                                    {s.institution.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[14.5px] font-bold text-zinc-800 dark:text-zinc-100 truncate">
                            {s.name}
                        </p>
                        <p className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1.5 truncate">
                            {s.institution}
                            {s.country && (
                                <>
                                    <span className="text-zinc-300 dark:text-zinc-600">·</span>
                                    {s.country}
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${typeMeta.bg} ${typeMeta.text}`}>
                        {s.type}
                    </span>
                    <span className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${coverageMeta.bg} ${coverageMeta.text}`}>
                        {s.coverage_type}
                    </span>
                    {s.recipients != null && (
                        <span className="text-[11.5px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {s.recipients.toLocaleString()}
                        </span>
                    )}
                    {s.monthly_amount != null && (
                        <span className="text-[11.5px] font-semibold text-[#1a6b8a] dark:text-[#3a9bbf]">
                            {s.currency_symbol}{s.monthly_amount.toLocaleString()}/mo
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Public view */}
                    <a
                        href={`/scholarships/${s.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-[#1a6b8a] dark:hover:text-[#3a9bbf] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                        title="View public page"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>

                    {/* Edit */}
                    <Link
                        href={`/contributor/scholarships/${s.id}/edit`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-[#1a6b8a] dark:hover:text-[#3a9bbf] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all no-underline"
                        title="Edit"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>

                    {/* Delete */}
                    <button
                        onClick={() => onDelete(s)}
                        title="Delete"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function MyScholarships() {
    const { scholarships } = usePage<PageProps>().props;
    const [toDelete, setToDelete] = useState<ScholarshipItem | null>(null);

    return (
        <>
            <Head title="My Scholarships" />

            <div className="flex-1 min-h-screen bg-[#f3f4f6] dark:bg-zinc-950 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-5 sm:px-6 py-10">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-[24px] font-bold text-zinc-800 dark:text-zinc-100">
                                My Scholarships
                            </h1>
                            <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 mt-1">
                                {scholarships.length} scholarship{scholarships.length !== 1 ? 's' : ''} published
                            </p>
                        </div>
                        <Link
                            href="/contributor/scholarships/create"
                            className="flex items-center gap-2 bg-[#1a6b8a] hover:bg-[#155878] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-xl transition-all no-underline shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            Add Scholarship
                        </Link>
                    </div>

                    {/* List */}
                    {scholarships.length === 0 ? (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-16 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[#1a6b8a]/10 dark:bg-[#1a6b8a]/20 flex items-center justify-center mx-auto mb-4">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#1a6b8a] dark:text-[#3a9bbf]">
                                    <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className="text-[15px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                No scholarships yet
                            </p>
                            <p className="text-[13px] text-zinc-400 dark:text-zinc-500 mb-5">
                                Add your first scholarship to help students discover funding opportunities
                            </p>
                            <Link
                                href="/contributor/scholarships/create"
                                className="inline-flex items-center gap-2 bg-[#1a6b8a] hover:bg-[#155878] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-xl transition-all no-underline"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                Add Your First Scholarship
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {scholarships.map((s) => (
                                <ScholarshipRow
                                    key={s.id}
                                    scholarship={s}
                                    onDelete={setToDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {toDelete && (
                <DeleteModal
                    scholarship={toDelete}
                    onCancel={() => setToDelete(null)}
                />
            )}
        </>
    );
}
