import { useState, useRef, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProgramCount {
    bachelors: number;
    masters:   number;
    phd:       number;
    total:     number;
}

interface UniversityExpense {
    annual_tuition:  number | null;
    room_and_board:  number | null;
    application_fee: number | null;
}

interface University {
    id:                  number;
    name:                string;
    abbreviation:        string | null;
    slug:                string;
    logo:                string | null;
    cover_image:         string | null;
    website:             string | null;
    city:                string | null;
    state:               string | null;
    country:             string;
    country_code:        string | null;
    category:            string;
    qs_ranking:          number | null;
    acceptance_rate:     number | null;
    programs_count:      ProgramCount;
    scholarships_count:  number;
    expenses:            UniversityExpense | null;
}

interface Filters {
    country_codes:       string[];
    categories:          string[];
    subjects:            string[];
    qs_ranking_min:      number;
    qs_ranking_max:      number;
    acceptance_rate_max: number;
    max_tuition:         number;
    max_room_and_board:  number;
    has_scholarships:    boolean;
    degree_types:        string[];
}

interface PageProps {
    universities: University[];
    filters:      Filters;
    total:        number;
    [key: string]: unknown;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'DE', name: 'Germany' },
    { code: 'AU', name: 'Australia' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'SG', name: 'Singapore' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'KR', name: 'South Korea' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'IN', name: 'India' },
    { code: 'CN', name: 'China' },
];

const CATEGORIES = ['Public Research','Private Research','Liberal Arts','Technical','Community College','Other'];

const SUBJECTS = [
    'Computer Science','Engineering','Business Administration','Medicine','Law',
    'Psychology','Economics','Physics','Mathematics','Chemistry','Biology',
    'Architecture','Arts','Education','Nursing','Pharmacy','Dentistry',
    'Environmental Science','Political Science','International Relations',
    'Marketing','Finance','Accounting',
];

const EXAMPLE_PROMPTS = [
    "Universities in USA with QS ranking under 100 that offer scholarships",
    "Affordable universities in Germany for Computer Science",
    "Top universities in UK with reasonable housing costs",
    "Universities in Massachusetts with acceptance rate above 20%",
];

// ── University Card ───────────────────────────────────────────────────────────
type CardTab = 'programs' | 'scholarships' | 'expenses';

function UniversityCard({ university }: { university: University }) {
    const [tab, setTab] = useState<CardTab>('programs');

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200">
            <div className="flex gap-0">
                {/* Cover image */}
                <div className="w-44 sm:w-52 shrink-0 relative overflow-hidden">
                    {university.cover_image ? (
                        <img src={university.cover_image} alt={university.name}
                            className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center">
                            <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col gap-3 min-w-0">

                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            {university.logo ? (
                                <img src={university.logo} alt="logo"
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-700 shrink-0" />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                                        {university.abbreviation?.[0] ?? university.name[0]}
                                    </span>
                                </div>
                            )}
                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate text-[15px]">
                                    {university.name}
                                </h3>
                                <p className="text-[13px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    {[university.city, university.country].filter(Boolean).join(', ')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 shrink-0">
                            {university.website && (
                                <a href={university.website} target="_blank" rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 hover:border-blue-300 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                    Website
                                </a>
                            )}
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                                {university.category}
                            </span>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {university.qs_ranking && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full px-2.5 py-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                                </svg>
                                #{university.qs_ranking} QS Ranking
                            </span>
                        )}
                        {university.acceptance_rate && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-full px-2.5 py-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                                </svg>
                                {university.acceptance_rate}% acceptance
                            </span>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800">
                        {(['programs','scholarships','expenses'] as CardTab[]).map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`pb-2 text-[13px] font-semibold capitalize transition-colors border-b-2 -mb-px ${
                                    tab === t
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}>
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    {tab === 'programs' && (
                        <div className="flex gap-3">
                            {[
                                { label: "Bachelor's", count: university.programs_count.bachelors, icon: '🎓' },
                                { label: "Master's",   count: university.programs_count.masters,   icon: '⭐' },
                                { label: 'PhD',        count: university.programs_count.phd,        icon: '👥' },
                            ].map(({ label, count, icon }) => (
                                <div key={label} className="flex-1 bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3 text-center">
                                    <p className="text-lg mb-1">{icon}</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
                                    <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{count}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'scholarships' && (
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3 text-center">
                                <p className="text-lg mb-1">🏆</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Available Scholarships</p>
                                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{university.scholarships_count}</p>
                            </div>
                            {university.scholarships_count === 0 && (
                                <p className="text-[13px] text-slate-400 dark:text-slate-500 italic">No scholarships listed yet</p>
                            )}
                        </div>
                    )}

                    {tab === 'expenses' && university.expenses && (
                        <div className="flex gap-3">
                            {[
                                { label: 'Annual Tuition', value: university.expenses.annual_tuition, prefix: '$' },
                                { label: 'Room & Board',   value: university.expenses.room_and_board,  prefix: '$' },
                                { label: 'App Fee',        value: university.expenses.application_fee, prefix: '$' },
                            ].map(({ label, value, prefix }) => (
                                <div key={label} className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl p-3 text-center">
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                                    <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
                                        {value ? `${prefix}${Number(value).toLocaleString()}` : 'N/A'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'expenses' && !university.expenses && (
                        <p className="text-[13px] text-slate-400 dark:text-slate-500 italic">No expense data available</p>
                    )}

                    {/* View Details */}
                    <div className="flex justify-end mt-auto">
                        <Link href={`/universities/${university.slug}`}
                            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-blue-200 dark:shadow-blue-900/30">
                            View Details
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Dual range slider ─────────────────────────────────────────────────────────
function RangeSlider({ min, max, value, onChange, prefix = '', suffix = '' }: {
    min: number; max: number; value: number;
    onChange: (v: number) => void;
    prefix?: string; suffix?: string;
}) {
    return (
        <div>
            <input type="range" min={min} max={max} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer" />
            <div className="flex justify-between mt-1">
                <span className="text-xs text-slate-400">{prefix}{min.toLocaleString()}{suffix}</span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {prefix}{value.toLocaleString()}{suffix}
                </span>
                <span className="text-xs text-slate-400">{prefix}{max.toLocaleString()}{suffix}</span>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UniversityIndex() {
    const { universities: initialUniversities, filters: initialFilters, total: initialTotal }
        = usePage<PageProps>().props;

    const [universities, setUniversities] = useState<University[]>(initialUniversities);
    const [total, setTotal]               = useState(initialTotal);
    const [showFilters, setShowFilters]   = useState(false);
    const [aiPrompt, setAiPrompt]         = useState('');
    const [aiLoading, setAiLoading]       = useState(false);
    const [aiError, setAiError]           = useState('');
    const [interpretedAs, setInterpretedAs] = useState('');
    const [isAiResults, setIsAiResults]   = useState(false);

    // Filter state
    const [countryCodes,      setCountryCodes]      = useState<string[]>(initialFilters.country_codes ?? []);
    const [categories,        setCategories]        = useState<string[]>(initialFilters.categories ?? []);
    const [subjects,          setSubjects]          = useState<string[]>(initialFilters.subjects ?? []);
    const [subjectSearch,     setSubjectSearch]     = useState('');
    const [qsMax,             setQsMax]             = useState(initialFilters.qs_ranking_max ?? 1000);
    const [acceptanceMax,     setAcceptanceMax]     = useState(initialFilters.acceptance_rate_max ?? 100);
    const [tuitionMax,        setTuitionMax]        = useState(initialFilters.max_tuition ?? 80000);
    const [hasScholarships,   setHasScholarships]   = useState(initialFilters.has_scholarships ?? false);

    function toggleArr<T>(arr: T[], item: T): T[] {
        return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
    }

    function handleApplyFilters() {
        setIsAiResults(false);
        setInterpretedAs('');
        router.get('/universities', {
            country_codes:       countryCodes,
            categories,
            subjects,
            qs_ranking_max:      qsMax,
            acceptance_rate_max: acceptanceMax,
            max_tuition:         tuitionMax,
            has_scholarships:    hasScholarships,
        }, {
            preserveState: true,
            onSuccess: (page) => {
                const props = page.props as PageProps;
                setUniversities(props.universities);
                setTotal(props.total);
                setShowFilters(false);
            },
        });
    }

    function handleReset() {
        setCountryCodes([]); setCategories([]); setSubjects([]);
        setQsMax(1000); setAcceptanceMax(100); setTuitionMax(80000);
        setHasScholarships(false);
    }

    async function handleAiSearch() {
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        setAiError('');
        setInterpretedAs('');

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await axios.post('/universities/ai-search', { prompt: aiPrompt }, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });

            setUniversities(res.data.universities);
            setTotal(res.data.total);
            setIsAiResults(true);
            if (res.data.interpreted_as) setInterpretedAs(res.data.interpreted_as);

            // Sync filter panel with AI results
            const f = res.data.filters ?? {};
            if (f.country_codes)  setCountryCodes(f.country_codes);
            if (f.categories)     setCategories(f.categories);
            if (f.subjects)       setSubjects(f.subjects);
            if (f.qs_ranking_max) setQsMax(f.qs_ranking_max);

        } catch (err: any) {
            setAiError(err.response?.data?.error ?? 'Something went wrong. Please try again.');
        } finally {
            setAiLoading(false);
        }
    }

    function handleClearAi() {
        setAiPrompt('');
        setIsAiResults(false);
        setInterpretedAs('');
        setUniversities(initialUniversities);
        setTotal(initialTotal);
    }

    const filteredSubjects = SUBJECTS.filter(s =>
        s.toLowerCase().includes(subjectSearch.toLowerCase())
    );

    return (
        <>
            <Head title="University Search" />

            <div className="min-h-screen bg-[#f5f5f0] dark:bg-slate-950">

                {/* ── Hero Header ── */}
                <div className="bg-[#f5f5f0] dark:bg-slate-950 px-6 pt-10 pb-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-700 dark:text-slate-200 tracking-tight mb-2"
                        style={{ fontFamily: 'Georgia, serif' }}>
                        University Search
                    </h1>
                    <p className="text-slate-400 dark:text-slate-500 text-base mb-8">
                        Discover and compare universities from around the world
                    </p>

                    {/* ── AI Search Bar ── */}
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            {/* Prompt input */}
                            <div className="flex items-center gap-3 px-5 py-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={aiPrompt}
                                    onChange={e => setAiPrompt(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
                                    placeholder="Describe what you're looking for... e.g. 'universities in USA with QS ranking under 200 offering scholarships'"
                                    className="flex-1 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600"
                                />
                                {aiPrompt && (
                                    <button onClick={handleClearAi}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Bottom row */}
                            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                                    <span className="text-[11px] text-slate-400 shrink-0">Try:</span>
                                    {EXAMPLE_PROMPTS.slice(0, 2).map(p => (
                                        <button key={p} onClick={() => setAiPrompt(p)}
                                            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 shrink-0 transition-colors">
                                            {p.length > 40 ? p.slice(0, 40) + '…' : p}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handleAiSearch}
                                    disabled={aiLoading || !aiPrompt.trim()}
                                    className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors shrink-0 ml-3">
                                    {aiLoading ? (
                                        <>
                                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                            </svg>
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                                                <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                            Search
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* AI error */}
                        {aiError && (
                            <p className="mt-2 text-sm text-red-500 dark:text-red-400 text-center">{aiError}</p>
                        )}
                    </div>
                </div>

                {/* ── Results bar ── */}
                <div className="px-6 sm:px-10 pb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {total} {total === 1 ? 'university' : 'universities'} found
                            </span>
                        </div>

                        {/* AI interpreted as */}
                        {interpretedAs && (
                            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full px-3 py-1.5">
                                <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium truncate max-w-xs">
                                    {interpretedAs}
                                </span>
                            </div>
                        )}
                    </div>

                    <button onClick={() => setShowFilters(true)}
                        className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
                        </svg>
                        Filters
                        {(countryCodes.length + categories.length + subjects.length + (hasScholarships ? 1 : 0)) > 0 && (
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                                {countryCodes.length + categories.length + subjects.length + (hasScholarships ? 1 : 0)}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── University List ── */}
                <div className="px-6 sm:px-10 pb-16 space-y-4">
                    {universities.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                                </svg>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 font-semibold">No universities found</p>
                            <p className="text-slate-400 dark:text-slate-600 text-sm mt-1">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        universities.map(u => <UniversityCard key={u.id} university={u} />)
                    )}
                </div>
            </div>

            {/* ── Filter Drawer ── */}
            {showFilters && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowFilters(false)} />

                    <div className="relative ml-auto w-full max-w-sm bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl overflow-hidden">

                        {/* Drawer header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 14l9-5-9-5-9 5 9 5z"/>
                                    </svg>
                                </div>
                                <h2 className="font-bold text-slate-800 dark:text-slate-100">Filter Universities</h2>
                            </div>
                            <button onClick={() => setShowFilters(false)}
                                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        {/* Reset */}
                        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <button onClick={handleReset}
                                className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                </svg>
                                Reset
                            </button>
                        </div>

                        {/* Scrollable filters */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                            {/* Countries */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Countries</h3>
                                <div className="space-y-2">
                                    {COUNTRIES.map(c => (
                                        <label key={c.code} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox"
                                                checked={countryCodes.includes(c.code)}
                                                onChange={() => setCountryCodes(prev => toggleArr(prev, c.code))}
                                                className="w-4 h-4 rounded accent-blue-600"/>
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-7">{c.code}</span>
                                            <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">{c.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Category */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Category</h3>
                                <div className="space-y-2">
                                    {CATEGORIES.map(c => (
                                        <label key={c} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox"
                                                checked={categories.includes(c)}
                                                onChange={() => setCategories(prev => toggleArr(prev, c))}
                                                className="w-4 h-4 rounded accent-blue-600"/>
                                            <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">{c}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Programs / Subject */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Programs / Subject</h3>
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 mb-3">
                                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    <input type="text" placeholder="Search programs..."
                                        value={subjectSearch}
                                        onChange={e => setSubjectSearch(e.target.value)}
                                        className="flex-1 bg-transparent text-sm outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600"/>
                                </div>
                                <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                                    {filteredSubjects.map(s => (
                                        <label key={s} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox"
                                                checked={subjects.includes(s)}
                                                onChange={() => setSubjects(prev => toggleArr(prev, s))}
                                                className="w-4 h-4 rounded accent-blue-600"/>
                                            <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">{s}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* QS Ranking */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">QS World Ranking</h3>
                                <RangeSlider min={1} max={1000} value={qsMax}
                                    onChange={setQsMax} prefix="#" />
                            </div>

                            {/* Acceptance Rate */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Acceptance Rate</h3>
                                <RangeSlider min={1} max={100} value={acceptanceMax}
                                    onChange={setAcceptanceMax} suffix="%" />
                            </div>

                            {/* Annual Tuition */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Annual Tuition</h3>
                                <RangeSlider min={1000} max={80000} value={tuitionMax}
                                    onChange={setTuitionMax} prefix="$" />
                            </div>

                            {/* Scholarships toggle */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">Has Scholarships</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Only show universities with scholarships</p>
                                    </div>
                                    <div onClick={() => setHasScholarships(v => !v)}
                                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${hasScholarships ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${hasScholarships ? 'translate-x-5' : ''}`}/>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Apply button */}
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                            <button onClick={handleApplyFilters}
                                className="w-full bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-semibold py-3 rounded-xl transition-colors">
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
