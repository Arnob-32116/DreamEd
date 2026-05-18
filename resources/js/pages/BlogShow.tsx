import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import type { BlogPost } from '@/layouts/BlogPageLayout/blogData';

interface BlogShowProps {
    post: BlogPost & { views?: number; content: string };
    relatedPosts?: BlogPost[];
    isOwner?: boolean;
    [key: string]: unknown;
}

const CATEGORY_COLORS: Record<string, string> = {
    'Study Abroad': '#2e7d8c',
    'Student Life': '#3a6ba8',
    'Career':       '#5a4a8a',
    'Programs':     '#2d6a4f',
    'Side Hustle':  '#6b4226',
    'Visa Guide':   '#7a5c2e',
    'Education':    '#4a5568',
    'Scholarship':  '#7b5bb5',
};

const FALLBACK_COLORS: Record<string, string> = {
    'Study Abroad': '#c9a96e',
    'Student Life': '#6a8fa8',
    'Career':       '#7a6a5a',
    'Programs':     '#8a9a7a',
    'Side Hustle':  '#3a3a4a',
    'Visa Guide':   '#7a8a9a',
    'Education':    '#b0b0b0',
    'Scholarship':  '#e8c97a',
};

// ── Static sample ads ─────────────────────────────────────────────────────────
const ADS = [
    {
        id: 1,
        label: 'Sponsored',
        title: 'Study in Canada 🍁',
        body: 'Free consultation with certified immigration experts. Limited spots.',
        cta: 'Book Free Call',
        accent: '#2e7d8c',
        bg: 'from-teal-50 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/30',
        border: 'border-teal-200 dark:border-teal-800',
    },
    {
        id: 2,
        label: 'Promotion',
        title: 'IELTS Crash Course',
        body: 'Score 7+ in 30 days. Live classes, mock tests & personalised feedback.',
        cta: 'Enroll Now →',
        accent: '#7b5bb5',
        bg: 'from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30',
        border: 'border-violet-200 dark:border-violet-800',
    },
    {
        id: 3,
        label: 'Sponsored',
        title: 'Scholarship Finder',
        body: 'Match with 500+ scholarships in 2 minutes. Completely free.',
        cta: 'Find Scholarships',
        accent: '#2d6a4f',
        bg: 'from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/30',
        border: 'border-emerald-200 dark:border-emerald-800',
    },
];

// ── Dismissible ad card ───────────────────────────────────────────────────────
function AdCard({ ad }: { ad: typeof ADS[number] }) {
    const [dismissed, setDismissed] = useState(false);
    if (dismissed) return null;

    return (
        <div className={`relative rounded-xl border bg-gradient-to-br ${ad.bg} ${ad.border} p-4`}>
            <button
                onClick={() => setDismissed(true)}
                title="Close ad"
                className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 transition-colors leading-none"
            >
                ✕
            </button>
            <span
                className="block text-[9.5px] font-bold uppercase tracking-widest mb-2"
                style={{ color: ad.accent }}
            >
                {ad.label}
            </span>
            <p className="font-bold text-[13px] text-zinc-800 dark:text-zinc-100 mb-1 pr-4 leading-snug">{ad.title}</p>
            <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">{ad.body}</p>
            <button
                className="text-[11.5px] font-semibold text-white px-3 py-1.5 rounded-lg hover:opacity-90 active:scale-95 transition-all"
                style={{ backgroundColor: ad.accent }}
            >
                {ad.cta}
            </button>
        </div>
    );
}

// ── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteModal({ postId, onCancel }: { postId: number; onCancel: () => void }) {
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        router.delete(`/blogs/${postId}`, {
            onSuccess: () => router.visit('/blog'),
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
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-red-500">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <h3 className="text-[17px] font-bold text-zinc-800 dark:text-zinc-100 text-center mb-2">Delete this post?</h3>
                <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 text-center leading-relaxed mb-6">
                    This cannot be undone. The post and its cover image will be permanently removed.
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
                        className="flex-1 py-2.5 rounded-xl text-[13.5px] font-semibold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors disabled:opacity-60"
                    >
                        {deleting ? 'Deleting…' : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BlogShow() {
    const { post, relatedPosts = [], isOwner = false } = usePage<BlogShowProps>().props;
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const categoryColor = CATEGORY_COLORS[post.category] || '#5a4a8a';
    const fallbackColor = FALLBACK_COLORS[post.category] || '#c8c8d0';
    const paragraphs    = (post.content || '').split('\n').filter((l) => l.trim() !== '');

    return (
        <>
            <Head title={post.title} />

            <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950">

                {/* ── Sticky Nav ── */}
                <div className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
                    <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
                        <Link
                            href="/blog"
                            className="flex items-center gap-2 text-[13.5px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-violet-700 dark:hover:text-violet-400 transition-colors no-underline group"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                className="transition-transform duration-200 group-hover:-translate-x-0.5">
                                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Back to Blog
                        </Link>

                        <div className="flex items-center gap-3">
                            <span className="text-[12px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                {(post.views ?? 0).toLocaleString()} views
                            </span>
                            <span className="text-[12px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
                                    <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                {(post.shares ?? 0).toLocaleString()} shares
                            </span>

                            {/* Delete — only for owner */}
                            {isOwner && (
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center gap-1.5 text-[12.5px] font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-lg transition-all"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Delete Post
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Cover Image ── */}
                {post.cover_image ? (
                    <div className="w-full h-64 sm:h-80 md:h-[420px] overflow-hidden">
                        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="w-full h-40 sm:h-56 flex items-center justify-center" style={{ backgroundColor: fallbackColor }}>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="opacity-30">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="1.5" />
                            <circle cx="8.5" cy="8.5" r="1.5" stroke="white" strokeWidth="1.5" />
                            <path d="M21 15L16 10L5 21" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                    </div>
                )}

                {/* ── Three-column: left ads | article | right ads ── */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex gap-6 items-start">

                    {/* Left sidebar ads — desktop only */}
                    <aside className="hidden xl:flex flex-col gap-4 w-[190px] shrink-0 sticky top-20">
                        <AdCard ad={ADS[0]} />
                        <AdCard ad={ADS[1]} />
                    </aside>

                    {/* ── Article ── */}
                    <article className="flex-1 min-w-0">

                        {/* Category + read time */}
                        <div className="flex flex-wrap items-center gap-3 mb-5">
                            <span
                                className="text-white text-[11.5px] font-semibold px-3.5 py-1.5 rounded-full"
                                style={{ backgroundColor: categoryColor }}
                            >
                                {post.category}
                            </span>
                            <span className="text-[12.5px] text-zinc-400 dark:text-zinc-500">{post.readTime}</span>
                            {/* Inline views on smaller screens */}
                            <span className="ml-auto text-[12px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 xl:hidden">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                {(post.views ?? 0).toLocaleString()} views
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight tracking-tight mb-5">
                            {post.title}
                        </h1>

                        {/* Excerpt */}
                        {post.excerpt && (
                            <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed border-l-4 pl-4 mb-7 italic"
                               style={{ borderColor: categoryColor }}>
                                {post.excerpt}
                            </p>
                        )}

                        {/* Author */}
                        <div className="flex items-center gap-3 pb-8 mb-8 border-b border-zinc-200 dark:border-zinc-800">
                            <div
                                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
                                style={{ backgroundColor: categoryColor }}
                            >
                                {post.authorAvatar}
                            </div>
                            <div>
                                <p className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-200">{post.author}</p>
                                <p className="text-[12px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 mt-0.5">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    {post.date}
                                </p>
                            </div>
                        </div>

                        {/* Mobile ad — between author and body */}
                        <div className="xl:hidden mb-8">
                            <AdCard ad={ADS[0]} />
                        </div>

                        {/* Body */}
                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                            {paragraphs.length > 0 ? (
                                paragraphs.map((para, i) => (
                                    <p key={i} className="text-[16px] text-zinc-700 dark:text-zinc-300 leading-[1.85] mb-5">
                                        {para}
                                    </p>
                                ))
                            ) : (
                                <p className="text-zinc-400 dark:text-zinc-600 italic text-center py-10">
                                    No content available for this post.
                                </p>
                            )}
                        </div>

                        {/* Mobile ad — after body */}
                        <div className="xl:hidden mt-8">
                            <AdCard ad={ADS[1]} />
                        </div>

                        {/* Bottom author card */}
                        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 flex items-start gap-4 border border-zinc-200 dark:border-zinc-800">
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[15px] font-bold shrink-0"
                                    style={{ backgroundColor: categoryColor }}
                                >
                                    {post.authorAvatar}
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Written by</p>
                                    <p className="text-[17px] font-bold text-zinc-800 dark:text-zinc-100">{post.author}</p>
                                    <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
                                        Published on {post.date} &middot; {post.readTime}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Right sidebar — desktop only */}
                    <aside className="hidden xl:flex flex-col gap-4 w-[190px] shrink-0 sticky top-20">
                        <AdCard ad={ADS[2]} />

                        {/* Stats widget */}
                        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 flex flex-col gap-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Post Stats</p>
                            <div className="flex items-center gap-2 text-[13px] text-zinc-600 dark:text-zinc-300">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                <span className="font-semibold">{(post.views ?? 0).toLocaleString()}</span>
                                <span className="text-zinc-400 text-[11px]">views</span>
                            </div>
                            <div className="flex items-center gap-2 text-[13px] text-zinc-600 dark:text-zinc-300">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
                                    <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                <span className="font-semibold">{(post.shares ?? 0).toLocaleString()}</span>
                                <span className="text-zinc-400 text-[11px]">shares</span>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* ── Related Posts ── */}
                {relatedPosts.length > 0 && (
                    <section className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-12 px-5 sm:px-8 mt-4">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-[22px] font-bold text-zinc-800 dark:text-zinc-100 mb-7">
                                More in <span style={{ color: categoryColor }}>{post.category}</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {relatedPosts.map((related) => {
                                    const href     = related.slug ? `/blogs/${related.slug}` : `/blogs/${related.id}`;
                                    const relColor = CATEGORY_COLORS[related.category] || '#555';
                                    return (
                                        <Link
                                            key={related.id}
                                            href={href}
                                            className="group bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg transition-all no-underline block"
                                        >
                                            <div
                                                className="h-36 overflow-hidden flex items-center justify-center"
                                                style={{ backgroundColor: related.cover_image ? undefined : (FALLBACK_COLORS[related.category] || '#ccc') }}
                                            >
                                                {related.cover_image ? (
                                                    <img src={related.cover_image} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                ) : (
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="opacity-30">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="1.5" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" stroke="white" strokeWidth="1.5" />
                                                        <path d="M21 15L16 10L5 21" stroke="white" strokeWidth="1.5" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <span className="text-white text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: relColor }}>
                                                    {related.category}
                                                </span>
                                                <h3 className="text-[14px] font-bold text-zinc-800 dark:text-zinc-100 mt-2 mb-1 leading-snug group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
                                                    {related.title}
                                                </h3>
                                                <p className="text-[12px] text-zinc-400 dark:text-zinc-500">{related.date} &bull; {related.readTime}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Footer CTA ── */}
                <div className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-10 text-center px-5">
                    <p className="text-zinc-500 dark:text-zinc-400 text-[14px] mb-4">Enjoyed this post? Explore more on our blog.</p>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white px-6 py-2.5 rounded-full text-[14px] font-semibold transition-colors no-underline"
                    >
                        Browse All Posts
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* ── Delete modal ── */}
            {showDeleteModal && (
                <DeleteModal postId={post.id} onCancel={() => setShowDeleteModal(false)} />
            )}
        </>
    );
}