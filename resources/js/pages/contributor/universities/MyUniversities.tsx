import { Head, Link, usePage } from '@inertiajs/react';

interface University {
    id: number;
    name: string;
    abbreviation: string;
    slug: string;
    logo: string | null;
    cover_image: string | null;
    country: string;
    country_code: string;
    category: string;
    qs_ranking: number | null;
    acceptance_rate: number | null;
    is_published: boolean;
    programs_count: number;
    scholarships_count: number;
}

interface Props {
    universities: University[];
    [key: string]: unknown;
}

const CATEGORY_COLORS: Record<string, string> = {
    'Public Research':   'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'Private Research':  'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    'Liberal Arts':      'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    'Technical':         'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    'Community College': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    'Other':             'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
};

export default function MyUniversities() {
    const { universities } = usePage<Props>().props;

    return (
        <>
            <Head title="My Universities" />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

                {/* Header */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-5">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Universities</h1>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                                {universities.length} {universities.length === 1 ? 'university' : 'universities'} submitted
                            </p>
                        </div>
                        <Link
                            href="/contributor/universities/create"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-all shadow-sm shadow-blue-200 dark:shadow-blue-900/40"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add University
                        </Link>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 py-8">

                    {universities.length === 0 ? (
                        /* Empty state */
                        <div className="text-center py-24">
                            <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-5">
                                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No universities yet</h2>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mb-6 max-w-sm mx-auto">
                                Start contributing by adding your first university. Help students discover great institutions worldwide.
                            </p>
                            <Link
                                href="/contributor/universities/create"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Your First University
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {universities.map((uni) => (
                                <div
                                    key={uni.id}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all"
                                >
                                    <div className="flex items-start gap-4 p-5">

                                        {/* Cover + Logo */}
                                        <div className="relative shrink-0">
                                            <div
                                                className="w-24 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600"
                                            >
                                                {uni.cover_image && (
                                                    <img src={uni.cover_image} alt={uni.name} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            {uni.logo && (
                                                <img
                                                    src={uni.logo}
                                                    alt={`${uni.name} logo`}
                                                    className="absolute -bottom-2 -right-2 w-9 h-9 rounded-lg object-cover border-2 border-white dark:border-slate-900 shadow-sm"
                                                />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 pt-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <h2 className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                                            {uni.name}
                                                        </h2>
                                                        {uni.abbreviation && (
                                                            <span className="text-xs text-slate-400 font-medium shrink-0">
                                                                ({uni.abbreviation})
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[uni.category] || CATEGORY_COLORS['Other']}`}>
                                                            {uni.category}
                                                        </span>
                                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            </svg>
                                                            {uni.country}
                                                        </span>
                                                        {uni.qs_ranking && (
                                                            <span className="text-xs text-slate-400">
                                                                #{uni.qs_ranking} QS
                                                            </span>
                                                        )}
                                                        {uni.acceptance_rate && (
                                                            <span className="text-xs text-slate-400">
                                                                {uni.acceptance_rate}% acceptance
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Stats row */}
                                                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                                            </svg>
                                                            {uni.programs_count} programs
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {uni.scholarships_count} scholarships
                                                        </span>
                                                        <span className={`flex items-center gap-1 ${uni.is_published ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${uni.is_published ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                            {uni.is_published ? 'Published' : 'Draft'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Link
                                                        href={`/universities/${uni.slug}`}
                                                        target="_blank"
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={`/contributor/universities/${uni.slug}/edit`}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-semibold text-white transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
