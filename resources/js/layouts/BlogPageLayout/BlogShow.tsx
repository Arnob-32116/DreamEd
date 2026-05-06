import { Head, Link, usePage } from '@inertiajs/react';
import type { BlogPost } from '@/layouts/BlogPageLayout/blogData';

interface BlogShowProps {
    post: BlogPost & {
        views?: number;
        content: string;
    };
    relatedPosts?: BlogPost[];
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

export default function BlogShow() {
    const { post, relatedPosts = [] } = usePage<BlogShowProps>().props;

    const categoryColor = CATEGORY_COLORS[post.category] || '#5a4a8a';
    const fallbackColor = FALLBACK_COLORS[post.category] || '#c8c8d0';

    const paragraphs = (post.content || '')
        .split('\n')
        .filter((line) => line.trim() !== '');

    return (
        <>
            <Head title={post.title} />

            <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950">

                {/* ── Top Navigation Bar ── */}
                <div className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
                    <div className="max-w-4xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
                        <Link
                            href="/blog"
                            className="flex items-center gap-2 text-[13.5px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-violet-700 dark:hover:text-violet-400 transition-colors no-underline group"
                        >
                            <svg
                                width="16" height="16" viewBox="0 0 24 24" fill="none"
                                className="transition-transform duration-200 group-hover:-translate-x-0.5"
                            >
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
                        </div>
                    </div>
                </div>

                {/* ── Cover Image ── */}
                {post.cover_image ? (
                    <div className="w-full h-64 sm:h-80 md:h-[420px] overflow-hidden">
                        <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div
                        className="w-full h-40 sm:h-56 flex items-center justify-center"
                        style={{ backgroundColor: fallbackColor }}
                    >
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="opacity-30">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="1.5" />
                            <circle cx="8.5" cy="8.5" r="1.5" stroke="white" strokeWidth="1.5" />
                            <path d="M21 15L16 10L5 21" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                    </div>
                )}

                {/* ── Article ── */}
                <article className="max-w-3xl mx-auto px-5 sm:px-8 py-10">

                    {/* Category + read time */}
                    <div className="flex items-center gap-3 mb-5">
                        <span
                            className="text-white text-[11.5px] font-semibold px-3.5 py-1.5 rounded-full"
                            style={{ backgroundColor: categoryColor }}
                        >
                            {post.category}
                        </span>
                        <span className="text-[12.5px] text-zinc-400 dark:text-zinc-500">{post.readTime}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight tracking-tight mb-5">
                        {post.title}
                    </h1>

                    {/* Excerpt */}
                    {post.excerpt && (
                        <p
                            className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed border-l-4 pl-4 mb-7 italic"
                            style={{ borderColor: categoryColor }}
                        >
                            {post.excerpt}
                        </p>
                    )}

                    {/* Author meta */}
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

                    {/* Body content */}
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

                {/* ── Related Posts ── */}
                {relatedPosts.length > 0 && (
                    <section className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-12 px-5 sm:px-8 mt-4">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-[22px] font-bold text-zinc-800 dark:text-zinc-100 mb-7">
                                More in <span style={{ color: categoryColor }}>{post.category}</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {relatedPosts.map((related) => {
                                    // ✅ FIXED: was /blog/ (singular) — must match route /blogs/{slug}
                                    const href = related.slug ? `/blogs/${related.slug}` : `/blogs/${related.id}`;
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
                                                    <img
                                                        src={related.cover_image}
                                                        alt={related.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="opacity-30">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="1.5" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" stroke="white" strokeWidth="1.5" />
                                                        <path d="M21 15L16 10L5 21" stroke="white" strokeWidth="1.5" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <span
                                                    className="text-white text-[10px] font-semibold px-2.5 py-1 rounded-full"
                                                    style={{ backgroundColor: relColor }}
                                                >
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
        </>
    );
}
