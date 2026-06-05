import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Qualifications {
    min_degree: string;
    sat_act:    string;
    language:   string;
    min_cgpa:   string;
}

interface Program {
    id:                      number;
    name:                    string;
    school:                  string | null;
    degree_type:             string;
    duration:                string | null;
    tuition_fee:             number | null;
    application_deadline:    string | null;
    program_url:             string | null;
    required_qualifications: Qualifications | null;
    subjects:                string[];
}

interface Scholarship {
    id:                 number;
    name:               string;
    type:               string;
    coverage:           string;
    is_independent:     boolean;
    description:        string | null;
    total_amount:       number | null;
    recipients:         number | null;
    eligible_countries: number | null;
    programs_covered:   string | null;
    scholarship_url:    string | null;
}

interface Expense {
    annual_tuition:     number | null;
    room_and_board:     number | null;
    application_fee:    number | null;
    books_supplies:     number | null;
    transportation:     number | null;
    personal_expenses:  number | null;
    health_insurance:   number | null;
    financial_aid_note: string | null;
    financial_aid_url:  string | null;
}

interface University {
    id:               number;
    name:             string;
    abbreviation:     string | null;
    slug:             string;
    logo:             string | null;
    cover_image:      string | null;
    website:          string | null;
    city:             string | null;
    state:            string | null;
    country:          string;
    country_code:     string | null;
    category:         string;
    qs_ranking:       number | null;
    acceptance_rate:  number | null;
    student_count:    number | null;
    faculty_count:    number | null;
    founded_year:     number | null;
    president:        string | null;
    motto:            string | null;
    about:            string | null;
    life_in_city:     string | null;
    programs:         Program[];
    scholarships:     Scholarship[];
    expenses:         Expense | null;
}

interface PageProps {
    university: University;
    [key: string]: unknown;
}

type MainTab    = 'programs' | 'scholarships' | 'expenses';
type DegreeTab  = "Bachelor's" | "Master's" | "PhD";

// ── Stat badge ────────────────────────────────────────────────────────────────
function Badge({ children, color = 'blue' }: { children: React.ReactNode; color?: 'blue'|'green'|'slate' }) {
    const cls = {
        blue:  'bg-blue-800/80 text-blue-100 border-blue-700/50',
        green: 'bg-green-800/80 text-green-100 border-green-700/50',
        slate: 'bg-slate-700/80 text-slate-200 border-slate-600/50',
    }[color];
    return (
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border backdrop-blur-sm ${cls}`}>
            {children}
        </span>
    );
}

// ── Stat card (hero section) ──────────────────────────────────────────────────
function HeroStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-2.5">
            <span className="text-blue-200 shrink-0">{icon}</span>
            <div>
                <p className="text-[11px] text-blue-200 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
            </div>
        </div>
    );
}

// ── Program card ──────────────────────────────────────────────────────────────
function ProgramCard({ program }: { program: Program }) {
    const [showQuals, setShowQuals] = useState(false);
    const hasQuals = program.required_qualifications &&
        Object.values(program.required_qualifications).some(v => v);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[16px] leading-snug">
                        {program.name}
                    </h3>
                    {program.school && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                            {program.school}
                        </p>
                    )}
                </div>
                {hasQuals && (
                    <button onClick={() => setShowQuals(v => !v)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 whitespace-nowrap flex items-center gap-1">
                        {showQuals ? '← Back' : 'Show Required Qualifications →'}
                    </button>
                )}
            </div>

            {!showQuals ? (
                /* Default view: stats */
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                        <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-2">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Application Deadline</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {program.application_deadline
                                ? new Date(program.application_deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                : 'N/A'}
                        </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                        <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center mx-auto mb-2">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 14l9-5-9-5-9 5 9 5z"/>
                            </svg>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Degree</p>
                        <p className="text-sm font-bold text-purple-700 dark:text-purple-300">{program.degree_type}</p>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
                        <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center mx-auto mb-2">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Duration</p>
                        <p className="text-sm font-bold text-amber-700 dark:text-amber-300">{program.duration ?? 'N/A'}</p>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-2">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Tuition Fee</p>
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                            {program.tuition_fee ? `$${Number(program.tuition_fee).toLocaleString()}/year` : 'N/A'}
                        </p>
                    </div>
                </div>
            ) : (
                /* Qualifications view */
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { key: 'min_degree', label: 'Minimum Degree',    color: 'emerald', icon: '📘' },
                        { key: 'sat_act',    label: 'SAT/ACT Scores',    color: 'blue',    icon: '📊' },
                        { key: 'language',   label: 'Language Proficiency', color: 'purple', icon: '🌐' },
                        { key: 'min_cgpa',   label: 'Minimum CGPA',      color: 'amber',   icon: '✅' },
                    ].map(({ key, label, color, icon }) => {
                        const value = program.required_qualifications?.[key as keyof Qualifications];
                        if (!value) return null;
                        const colorMap: Record<string, string> = {
                            emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
                            blue:    'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
                            purple:  'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
                            amber:   'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
                        };
                        return (
                            <div key={key} className={`${colorMap[color]} rounded-xl p-4`}>
                                <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">{label}</p>
                                <p className="text-[13px] font-bold leading-snug">{value}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {program.program_url && (
                <div className="flex justify-end mt-4">
                    <a href={program.program_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors">
                        Visit Program Page
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                    </a>
                </div>
            )}
        </div>
    );
}

// ── Scholarship card ──────────────────────────────────────────────────────────
function ScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
    const stats = [
        { label: 'Programs',         value: '45',  color: 'blue',    icon: '🎓' },
        { label: 'Total Amount',     value: scholarship.total_amount     ? `$${Number(scholarship.total_amount).toLocaleString()}`     : 'N/A', color: 'emerald', icon: '💰' },
        { label: 'Countries',        value: scholarship.eligible_countries ? `${scholarship.eligible_countries}` : 'N/A', color: 'orange', icon: '🌍' },
        { label: 'Recipients',       value: scholarship.recipients        ? `${scholarship.recipients}`          : 'N/A', color: 'purple', icon: '👥' },
        { label: 'Programs Covered', value: scholarship.programs_covered  ?? 'N/A', color: 'slate',  icon: '✅' },
    ];

    const colorMap: Record<string, string> = {
        blue:    'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
        orange:  'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
        purple:  'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
        slate:   'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300',
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[15px]">{scholarship.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                            {scholarship.type}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-semibold">
                            {scholarship.coverage}
                        </span>
                    </div>
                </div>
            </div>

            {scholarship.description && (
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {scholarship.description}
                </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {stats.map(s => (
                    <div key={s.label} className={`${colorMap[s.color]} rounded-xl p-3 text-center`}>
                        <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">{s.label}</p>
                        <p className="text-sm font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            {scholarship.scholarship_url && (
                <div className="flex justify-end mt-4">
                    <a href={scholarship.scholarship_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors">
                        Visit Scholarship Page
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                    </a>
                </div>
            )}
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function UniversityShow() {
    const { university } = usePage<PageProps>().props;
    const [mainTab,   setMainTab]   = useState<MainTab>('programs');
    const [degreeTab, setDegreeTab] = useState<DegreeTab>("Bachelor's");

    const programsByDegree: Record<DegreeTab, Program[]> = {
        "Bachelor's": university.programs.filter(p => p.degree_type === "Bachelor's"),
        "Master's":   university.programs.filter(p => p.degree_type === "Master's"),
        "PhD":        university.programs.filter(p => p.degree_type === "PhD"),
    };

    const universityScholarships = university.scholarships.filter(s => !s.is_independent);
    const independentScholarships = university.scholarships.filter(s => s.is_independent);

    const location = [university.city, university.state, university.country].filter(Boolean).join(', ');

    const totalCost = university.expenses
        ? (['annual_tuition','room_and_board','application_fee','books_supplies','transportation','personal_expenses','health_insurance'] as const)
            .reduce((sum, k) => sum + (Number(university.expenses![k]) || 0), 0)
        : 0;

    // Life in city feature cards (parsed from life_in_city text)
    const cityFeatures = [
        { emoji: '🎭', title: 'Cultural Hub',         desc: 'World-class museums, theaters, and music venues' },
        { emoji: '🚇', title: 'Transportation',        desc: 'Excellent public transit and bike-friendly streets' },
        { emoji: '🍽️', title: 'Food & Dining',         desc: 'Diverse culinary scene with restaurants from around the world' },
        { emoji: '💡', title: 'Innovation District',   desc: 'Home to tech startups, research labs and innovation hubs' },
        { emoji: '🌳', title: 'Recreation',            desc: 'Parks, cycling paths, and easy access to nature' },
        { emoji: '💰', title: 'Cost of Living',        desc: 'Various student discounts and affordable housing options' },
    ];

    return (
        <>
            <Head title={university.name} />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

                {/* ── Hero Header ── */}
                <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 dark:from-blue-900 dark:via-blue-800 dark:to-slate-900">

                    {/* Back button */}
                    <div className="px-6 pt-5">
                        <Link href="/universities"
                            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm font-medium transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                            </svg>
                            Back to Universities
                        </Link>
                    </div>

                    <div className="px-6 sm:px-10 pt-6 pb-8">
                        <div className="flex flex-col sm:flex-row gap-6 items-start">

                            {/* Cover image */}
                            {university.cover_image && (
                                <div className="w-full sm:w-72 h-48 sm:h-52 rounded-2xl overflow-hidden shrink-0 shadow-xl">
                                    <img src={university.cover_image} alt={university.name}
                                        className="w-full h-full object-cover"/>
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-4 mb-4">
                                    {university.logo && (
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/30 shadow-lg shrink-0">
                                            <img src={university.logo} alt="logo" className="w-full h-full object-cover"/>
                                        </div>
                                    )}
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                                            {university.name}
                                        </h1>
                                        {university.abbreviation && (
                                            <p className="text-blue-200 font-semibold mt-0.5">{university.abbreviation}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-5">
                                    {university.qs_ranking && (
                                        <Badge color="blue">#{university.qs_ranking} QS World Ranking</Badge>
                                    )}
                                    {university.acceptance_rate && (
                                        <Badge color="green">{university.acceptance_rate}% Acceptance Rate</Badge>
                                    )}
                                    <Badge color="slate">{university.category}</Badge>
                                </div>

                                {/* Stats grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {location && (
                                        <HeroStat icon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                            </svg>
                                        } label="Location" value={location}/>
                                    )}
                                    {university.founded_year && (
                                        <HeroStat icon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                        } label="Established" value={String(university.founded_year)}/>
                                    )}
                                    {university.president && (
                                        <HeroStat icon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                            </svg>
                                        } label="President" value={university.president}/>
                                    )}
                                    {university.motto && (
                                        <HeroStat icon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                            </svg>
                                        } label="Motto" value={university.motto}/>
                                    )}
                                    {university.student_count && (
                                        <HeroStat icon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                                            </svg>
                                        } label="Students" value={university.student_count.toLocaleString()}/>
                                    )}
                                    {university.faculty_count && (
                                        <HeroStat icon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M12 14l9-5-9-5-9 5 9 5z"/>
                                            </svg>
                                        } label="Faculty" value={`${university.faculty_count.toLocaleString()}`}/>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="px-6 sm:px-10 py-8 space-y-6 max-w-5xl mx-auto">

                    {/* About */}
                    {university.about && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                </svg>
                                About {university.abbreviation ?? university.name}
                            </h2>
                            <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed">{university.about}</p>
                        </div>
                    )}

                    {/* Life in city */}
                    {university.life_in_city && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Life in {university.city ?? university.country}
                            </h2>
                            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">
                                Discover what makes {university.city ?? university.country} a great place to study and live
                            </p>
                            <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed mb-5">{university.life_in_city}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {cityFeatures.map(f => (
                                    <div key={f.title} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xl">{f.emoji}</span>
                                            <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400">{f.title}</h3>
                                        </div>
                                        <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Main Tabs ── */}
                    <div>
                        {/* Tab bar */}
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            {([
                                { key: 'programs',     label: 'Programs Offered', icon: '🎓' },
                                { key: 'scholarships', label: 'Scholarships',     icon: '🏆' },
                                { key: 'expenses',     label: 'Expenses',         icon: '💵' },
                            ] as { key: MainTab; label: string; icon: string }[]).map(tab => (
                                <button key={tab.key} onClick={() => setMainTab(tab.key)}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all ${
                                        mainTab === tab.key
                                            ? 'bg-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40'
                                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-blue-200 dark:hover:border-blue-800'
                                    }`}>
                                    <span>{tab.icon}</span>
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* ── Programs Tab ── */}
                        {mainTab === 'programs' && (
                            <div className="space-y-4">
                                {/* Degree sub-tabs */}
                                <div className="flex gap-2 flex-wrap">
                                    {(["Bachelor's","Master's","PhD"] as DegreeTab[]).map(d => (
                                        <button key={d} onClick={() => setDegreeTab(d)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all border ${
                                                degreeTab === d
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700'
                                            }`}>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M12 14l9-5-9-5-9 5 9 5z"/>
                                            </svg>
                                            {d} Programs ({programsByDegree[d].length})
                                        </button>
                                    ))}
                                </div>

                                {programsByDegree[degreeTab].length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 dark:text-slate-600">
                                        <p className="font-medium">No {degreeTab} programs listed yet</p>
                                    </div>
                                ) : (
                                    programsByDegree[degreeTab].map(p => (
                                        <ProgramCard key={p.id} program={p}/>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ── Scholarships Tab ── */}
                        {mainTab === 'scholarships' && (
                            <div className="space-y-4">
                                {/* Sub-tabs */}
                                <div className="flex gap-2">
                                    {[
                                        { key: 'university', label: `University Offered (${universityScholarships.length})` },
                                        { key: 'independent', label: `Independent Scholarships (${independentScholarships.length})` },
                                    ].map(t => (
                                        <button key={t.key}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>

                                {university.scholarships.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 dark:text-slate-600">
                                        <p className="font-medium">No scholarships listed yet</p>
                                    </div>
                                ) : (
                                    university.scholarships.map(s => (
                                        <ScholarshipCard key={s.id} scholarship={s}/>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ── Expenses Tab ── */}
                        {mainTab === 'expenses' && (
                            <div className="space-y-4">
                                {!university.expenses ? (
                                    <div className="text-center py-12 text-slate-400 dark:text-slate-600">
                                        <p className="font-medium">No expense data available</p>
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                                        <div>
                                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                </svg>
                                                Annual Costs & Expenses
                                            </h2>
                                            <p className="text-[13px] text-slate-400 dark:text-slate-500">
                                                Estimated costs for studying at {university.abbreviation ?? university.name}
                                            </p>
                                        </div>

                                        {/* Main 3 costs */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {[
                                                { label: 'Annual Tuition',  value: university.expenses.annual_tuition,  sub: 'Per academic year',   color: 'blue',    icon: '🎓' },
                                                { label: 'Room & Board',    value: university.expenses.room_and_board,  sub: 'Housing & meals',     color: 'orange',  icon: '🏠' },
                                                { label: 'Application Fee', value: university.expenses.application_fee, sub: 'Non-refundable',       color: 'emerald', icon: '📄' },
                                            ].map(({ label, value, sub, color, icon }) => {
                                                const colorMap: Record<string, string> = {
                                                    blue:    'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300',
                                                    orange:  'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-700 dark:text-orange-300',
                                                    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
                                                };
                                                return (
                                                    <div key={label} className={`${colorMap[color]} rounded-2xl border p-5 text-center`}>
                                                        <div className="w-12 h-12 rounded-full bg-white/60 dark:bg-slate-900/40 flex items-center justify-center mx-auto mb-3 text-xl shadow-sm">
                                                            {icon}
                                                        </div>
                                                        <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">{label}</p>
                                                        <p className="text-2xl font-extrabold">
                                                            {value ? `$${Number(value).toLocaleString()}` : 'N/A'}
                                                        </p>
                                                        <p className="text-[11px] opacity-60 mt-1">{sub}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Additional expenses */}
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
                                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4">
                                                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                </svg>
                                                Additional Estimated Expenses
                                            </h3>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                                {[
                                                    { label: 'Books & Supplies',   value: university.expenses.books_supplies },
                                                    { label: 'Personal Expenses',  value: university.expenses.personal_expenses },
                                                    { label: 'Transportation',     value: university.expenses.transportation },
                                                    { label: 'Health Insurance',   value: university.expenses.health_insurance },
                                                ].map(({ label, value }) => (
                                                    <div key={label} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
                                                        <span className="text-[13px] text-slate-600 dark:text-slate-400">{label}</span>
                                                        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
                                                            {value ? `$${Number(value).toLocaleString()}/year` : 'N/A'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Total */}
                                        {totalCost > 0 && (
                                            <div className="bg-blue-700 dark:bg-blue-800 rounded-2xl p-5 flex items-center justify-between text-white">
                                                <div>
                                                    <p className="font-semibold">Total Estimated Cost</p>
                                                    <p className="text-sm opacity-70">Per academic year (including all expenses)</p>
                                                </div>
                                                <p className="text-3xl font-extrabold">${totalCost.toLocaleString()}</p>
                                            </div>
                                        )}

                                        {/* Financial aid */}
                                        {university.expenses.financial_aid_note && (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-blue-800 dark:text-blue-200 mb-1">Financial Aid Available</p>
                                                        <p className="text-[13px] text-blue-700 dark:text-blue-300 leading-relaxed">
                                                            {university.expenses.financial_aid_note}
                                                        </p>
                                                        {university.expenses.financial_aid_url && (
                                                            <a href={university.expenses.financial_aid_url}
                                                                target="_blank" rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-semibold text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-xl transition-colors">
                                                                View Available Scholarships
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                                                </svg>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
