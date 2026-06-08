import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';

// ── Types ─────────────────────────────────────────────────────────────────────
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
    subject_areas:    string[];
}

interface Filters {
    country_codes:  string[];
    types:          string[];
    coverage_types: string[];
    subjects:       string[];
    min_monthly:    number;
    search:         string;
}

interface PageProps {
    scholarships: Scholarship[];
    filters:      Filters;
    total:        number;
    [key: string]: unknown;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'KR', name: 'South Korea' },
    { code: 'SG', name: 'Singapore' },
    { code: 'IN', name: 'India' },
    { code: 'BD', name: 'Bangladesh' },
];

const TYPES = ['Merit-Based','Need-Based','Athletic','Research','Government','Other'];

const COVERAGE_TYPES = ['Fully Funded','Partial','Tuition Only','Living Expenses','Full Ride'];

const SUBJECTS = [
    'Computer Science','Engineering','Business Administration','Medicine','Law',
    'Psychology','Economics','Physics','Mathematics','Chemistry','Biology',
    'Architecture','Arts','Education','Nursing','Environmental Science',
    'Political Science','International Relations','Finance','Accounting',
];

const EXAMPLE_PROMPTS = [
    "Fully funded government scholarships in Germany for engineering",
    "Merit-based scholarships with monthly stipend above $1000",
    "Research scholarships in Europe for PhD students",
    "Scholarships for developing countries with living allowance",
];

const TYPE_COLORS: Record<string, string> = {
    'Merit-Based':  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Need-Based':   'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'Government':   'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'Research':     'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'Athletic':     'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    'Other':        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

const COVERAGE_COLORS: Record<string, string> = {
    'Fully Funded':     'bg-blue-600 text-white',
    'Full Ride':        'bg-emerald-600 text-white',
    'Partial':          'bg-slate-500 text-white',
    'Tuition Only':     'bg-purple-600 text-white',
    'Living Expenses':  'bg-amber-500 text-white',
};

// ── Scholarship Card ──────────────────────────────────────────────────────────
function ScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
    const typeColor     = TYPE_COLORS[scholarship.type]          ?? TYPE_COLORS['Other'];
    const coverageColor = COVERAGE_COLORS[scholarship.coverage_type] ?? 'bg-slate-500 text-white';

    const stats = [
        {
            label: 'Monthly Stipend',
            value: scholarship.monthly_amount
                ? `${scholarship.currency_symbol}${Number(scholarship.monthly_amount).toLocaleString()}/mo`
                : 'N/A',
            color: 'blue',
        },
        {
            label: 'Duration',
            value: scholarship.duration ?? 'N/A',
            color: 'purple',
        },
        {
            label: 'Recipients',
            value: scholarship.recipients ? scholarship.recipients.toLocaleString() : 'N/A',
            color: 'emerald',
        },
        {
            label: 'Country',
            value: scholarship.country ?? 'International',
            color: 'amber',
        },
    ];

    const colorMap: Record<string, string> = {
        blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
        emerald:'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
        amber:  'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200">
            <div className="flex">
                {/* Cover / Logo panel */}
                <div className="w-40 sm:w-48 shrink-0 relative overflow-hidden">
                    {scholarship.cover_image ? (
                        <img src={scholarship.cover_image} alt={scholarship.name}
                            className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center min-h-[180px]">
                            {scholarship.logo ? (
                                <img src={scholarship.logo} alt={scholarship.institution}
                                    className="w-16 h-16 object-contain rounded-xl" />
                            ) : (
                                <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col gap-3 min-w-0">

                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {scholarship.logo && scholarship.cover_image && (
                                    <img src={scholarship.logo} alt="logo"
                                        className="w-7 h-7 rounded-lg object-contain border border-slate-100 dark:border-slate-700 shrink-0"/>
                                )}
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate">
                                    {scholarship.institution}
                                </p>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[15px] leading-snug">
                                {scholarship.name}
                            </h3>
                        </div>

                        <div className="flex items-start gap-2 shrink-0">
                            {scholarship.website && (
                                <a href={scholarship.website} target="_blank" rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 hover:border-blue-300 transition-colors flex items-center gap-1.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                    Website
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeColor}`}>
                            {scholarship.type}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${coverageColor}`}>
                            {scholarship.coverage_type}
                        </span>
                        {scholarship.country_code && (
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                {scholarship.country_code}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {scholarship.description && (
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                            {scholarship.description}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {stats.map(s => (
                            <div key={s.label} className={`${colorMap[s.color]} rounded-xl p-2.5 text-center`}>
                                <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">{s.label}</p>
                                <p className="text-[13px] font-bold truncate">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Subjects */}
                    {scholarship.subject_areas && scholarship.subject_areas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {scholarship.subject_areas.slice(0, 4).map((s, i) => (
                                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                    {typeof s === 'object' ? (s as any).name : s}
                                </span>
                            ))}
                            {scholarship.subject_areas.length > 4 && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                                    +{scholarship.subject_areas.length - 4} more
                                </span>
                            )}
                        </div>
                    )}

                    {/* View Details */}
                    <div className="flex justify-end mt-auto">
                        <Link href={`/scholarships/${scholarship.slug}`}
                            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ScholarshipIndex() {
    const { scholarships: initialScholarships, filters: initialFilters, total: initialTotal }
        = usePage<PageProps>().props;

    const [scholarships,    setScholarships]    = useState<Scholarship[]>(initialScholarships);
    const [total,           setTotal]           = useState(initialTotal);
    const [showFilters,     setShowFilters]     = useState(false);
    const [aiPrompt,        setAiPrompt]        = useState('');
    const [aiLoading,       setAiLoading]       = useState(false);
    const [aiError,         setAiError]         = useState('');
    const [interpretedAs,   setInterpretedAs]   = useState('');
    const [isAiResults,     setIsAiResults]     = useState(false);

    // Filter state
    const [countryCodes,    setCountryCodes]    = useState<string[]>(initialFilters.country_codes ?? []);
    const [types,           setTypes]           = useState<string[]>(initialFilters.types ?? []);
    const [coverageTypes,   setCoverageTypes]   = useState<string[]>(initialFilters.coverage_types ?? []);
    const [subjects,        setSubjects]        = useState<string[]>(initialFilters.subjects ?? []);
    const [subjectSearch,   setSubjectSearch]   = useState('');
    const [minMonthly,      setMinMonthly]      = useState(initialFilters.min_monthly ?? 0);

    function toggleArr<T>(arr: T[], item: T): T[] {
        return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
    }

    function handleApplyFilters() {
        setIsAiResults(false);
        setInterpretedAs('');
        router.get('/scholarships', {
            country_codes:  countryCodes,
            types,
            coverage_types: coverageTypes,
            subjects,
            min_monthly:    minMonthly,
        }, {
            preserveState: true,
            onSuccess: (page) => {
                const props = page.props as PageProps;
                setScholarships(props.scholarships);
                setTotal(props.total);
                setShowFilters(false);
            },
        });
    }

    function handleReset() {
        setCountryCodes([]); setTypes([]); setCoverageTypes([]);
        setSubjects([]); setMinMonthly(0);
    }

    async function handleAiSearch() {
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        setAiError('');
        setInterpretedAs('');

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await axios.post('/scholarships/ai-search', { prompt: aiPrompt }, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });

            setScholarships(res.data.scholarships);
            setTotal(res.data.total);
            setIsAiResults(true);
            if (res.data.interpreted_as) setInterpretedAs(res.data.interpreted_as);

            const f = res.data.filters ?? {};
            if (f.country_codes)  setCountryCodes(f.country_codes);
            if (f.types)          setTypes(f.types);
            if (f.coverage_types) setCoverageTypes(f.coverage_types);
            if (f.subjects)       setSubjects(f.subjects);

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
        setScholarships(initialScholarships);
        setTotal(initialTotal);
    }

    const filteredSubjects = SUBJECTS.filter(s =>
        s.toLowerCase().includes(subjectSearch.toLowerCase())
    );

    const activeFilterCount = countryCodes.length + types.length + coverageTypes.length +
        subjects.length + (minMonthly > 0 ? 1 : 0);

    return (
        <>
            <Head title="Scholarship Search" />

            <div className="min-h-screen bg-[#f5f5f0] dark:bg-slate-950">

                {/* ── Hero ── */}
                <div className="px-6 pt-10 pb-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-700 dark:text-slate-200 tracking-tight mb-2"
                        style={{ fontFamily: 'Georgia, serif' }}>
                        Scholarship Search
                    </h1>
                    <p className="text-slate-400 dark:text-slate-500 text-base mb-8">
                        Discover independent scholarships from around the world
                    </p>

                    {/* AI Search */}
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-3 px-5 py-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
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
                                    placeholder="Describe the scholarship you're looking for... e.g. 'fully funded government scholarships in Germany for engineering students'"
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

                            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                                    <span className="text-[11px] text-slate-400 shrink-0">Try:</span>
                                    {EXAMPLE_PROMPTS.slice(0, 2).map(p => (
                                        <button key={p} onClick={() => setAiPrompt(p)}
                                            className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline whitespace-nowrap px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 shrink-0">
                                            {p.length > 45 ? p.slice(0, 45) + '…' : p}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handleAiSearch}
                                    disabled={aiLoading || !aiPrompt.trim()}
                                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors shrink-0 ml-3">
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

                        {aiError && (
                            <p className="mt-2 text-sm text-red-500 dark:text-red-400 text-center">{aiError}</p>
                        )}
                    </div>
                </div>

                {/* ── Results bar ── */}
                <div className="px-6 sm:px-10 pb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"/>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {total} {total === 1 ? 'scholarship' : 'scholarships'} found
                            </span>
                        </div>

                        {interpretedAs && (
                            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-full px-3 py-1.5">
                                <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium truncate max-w-xs">
                                    {interpretedAs}
                                </span>
                            </div>
                        )}
                    </div>

                    <button onClick={() => setShowFilters(true)}
                        className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
                        </svg>
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── List ── */}
                <div className="px-6 sm:px-10 pb-16 space-y-4">
                    {scholarships.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 font-semibold">No scholarships found</p>
                            <p className="text-slate-400 dark:text-slate-600 text-sm mt-1">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        scholarships.map(s => <ScholarshipCard key={s.id} scholarship={s} />)
                    )}
                </div>
            </div>

            {/* ── Filter Drawer ── */}
            {showFilters && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFilters(false)}/>

                    <div className="relative ml-auto w-full max-w-sm bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <h2 className="font-bold text-slate-800 dark:text-slate-100">Filter Scholarships</h2>
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
                                className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                </svg>
                                Reset
                            </button>
                        </div>

                        {/* Scrollable */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                            {/* Countries */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Countries</h3>
                                <div className="space-y-2">
                                    {COUNTRIES.map(c => (
                                        <label key={c.code} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox"
                                                checked={countryCodes.includes(c.code)}
                                                onChange={() => setCountryCodes(prev => toggleArr(prev, c.code))}
                                                className="w-4 h-4 rounded accent-amber-500"/>
                                            <span className="text-xs font-bold text-slate-400 w-7">{c.code}</span>
                                            <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">{c.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Type */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Scholarship Type</h3>
                                <div className="space-y-2">
                                    {TYPES.map(t => (
                                        <label key={t} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox"
                                                checked={types.includes(t)}
                                                onChange={() => setTypes(prev => toggleArr(prev, t))}
                                                className="w-4 h-4 rounded accent-amber-500"/>
                                            <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">{t}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Coverage */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Coverage Type</h3>
                                <div className="space-y-2">
                                    {COVERAGE_TYPES.map(c => (
                                        <label key={c} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox"
                                                checked={coverageTypes.includes(c)}
                                                onChange={() => setCoverageTypes(prev => toggleArr(prev, c))}
                                                className="w-4 h-4 rounded accent-amber-500"/>
                                            <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">{c}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Subjects */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Field / Subject</h3>
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 mb-3">
                                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    <input type="text" placeholder="Search subjects..."
                                        value={subjectSearch}
                                        onChange={e => setSubjectSearch(e.target.value)}
                                        className="flex-1 bg-transparent text-sm outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"/>
                                </div>
                                <div className="max-h-44 overflow-y-auto space-y-2">
                                    {filteredSubjects.map(s => (
                                        <label key={s} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox"
                                                checked={subjects.includes(s)}
                                                onChange={() => setSubjects(prev => toggleArr(prev, s))}
                                                className="w-4 h-4 rounded accent-amber-500"/>
                                            <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">{s}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Min Monthly Stipend */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Minimum Monthly Stipend</h3>
                                <input type="range" min={0} max={3000} step={50} value={minMonthly}
                                    onChange={e => setMinMonthly(Number(e.target.value))}
                                    className="w-full accent-amber-500 cursor-pointer"/>
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs text-slate-400">$0</span>
                                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                        ${minMonthly.toLocaleString()}/mo
                                    </span>
                                    <span className="text-xs text-slate-400">$3,000</span>
                                </div>
                            </div>
                        </div>

                        {/* Apply */}
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                            <button onClick={handleApplyFilters}
                                className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-colors">
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
