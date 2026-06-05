import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import type { BlogPost } from '@/layouts/BlogPageLayout/blogData';

interface Props {
    post: BlogPost;
    isOwner?: boolean;
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

// ── Inline delete confirm modal ───────────────────────────────────────────────
function DeleteModal({ postId, onCancel }: { postId: number; onCancel: () => void }) {
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        router.delete(`/blogs/${postId}`, {
            onError:  () => setDeleting(false),
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onCancel()}
        >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 w-full max-w-sm p-6">
                <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-500">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <h3 className="text-[16px] font-bold text-zinc-800 dark:text-zinc-100 text-center mb-2">Delete this post?</h3>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 text-center leading-relaxed mb-5">
                    This cannot be undone. The post and its cover image will be permanently removed.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors disabled:opacity-60"
                    >
                        {deleting ? 'Deleting…' : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Blog card ─────────────────────────────────────────────────────────────────
export default function BlogCard({ post, isOwner = false }: Props) {
    const [hovered, setHovered]         = useState(false);
    const [imgError, setImgError]       = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const categoryColor = CATEGORY_COLORS[post.category] || '#555';
    const fallbackColor = post.imageColor || FALLBACK_COLORS[post.category] || '#c8c8d0';
    const hasImage      = !!(post.cover_image && !imgError);
    const postHref      = post.slug ? `/blogs/${post.slug}` : `/blogs/${post.id}`;

    return (
        <>
            <div
                className={`
                    relative bg-white dark:bg-zinc-900
                    border border-zinc-200 dark:border-zinc-800
                    rounded-2xl overflow-hidden flex flex-col
                    transition-all duration-300
                    ${hovered
                        ? 'shadow-2xl shadow-violet-200/40 dark:shadow-violet-900/30 -translate-y-2 scale-[1.012] border-violet-300 dark:border-violet-700'
                        : 'shadow-sm'
                    }
                `}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Delete button — top-right corner, owner only */}
                {isOwner && (
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteModal(true); }}
                        title="Delete post"
                        className="absolute top-2.5 left-2.5 z-20 w-7 h-7 flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-md transition-all hover:scale-110 active:scale-95"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                )}

                <Link href={postHref} className="flex flex-col flex-1 no-underline">
                    {/* Cover Image */}
                    <div
                        className="relative h-52 flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: hasImage ? undefined : fallbackColor }}
                    >
                        {hasImage ? (
                            <img
                                src={post.cover_image!}
                                alt={post.title}
                                className={`w-full h-full object-cover transition-all duration-300 ${hovered ? 'scale-105' : 'scale-100'}`}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="opacity-40">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                                    <circle cx="8.5" cy="8.5" r="1.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                                    <path d="M21 15L16 10L5 21" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinejoin="round" />
                                </svg>
                            </div>
                        )}

                        {/* Category badge */}
                        <span
                            className="absolute top-3 right-3 text-white text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-sm shadow-md z-10"
                            style={{ backgroundColor: categoryColor }}
                        >
                            {post.category}
                        </span>

                        {/* "My Post" badge for owner */}
                        {isOwner && (
                            <span className="absolute bottom-3 right-3 z-10 text-[10px] font-bold text-white bg-violet-600/90 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                My Post
                            </span>
                        )}
                    </div>

                    {/* Card body */}
                    <div className="p-5 flex flex-col flex-1 gap-3">
                        <h3 className={`text-[16px] font-bold leading-snug transition-colors duration-200 ${
                            hovered ? 'text-violet-700 dark:text-violet-400' : 'text-zinc-800 dark:text-zinc-100'
                        }`}>
                            {post.title}
                        </h3>

                        {/* Author */}
                        <div className="flex items-center gap-2.5">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                                style={{ backgroundColor: categoryColor }}
                            >
                                {post.authorAvatar}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-200">{post.author}</span>
                                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    {post.date} &bull; {post.readTime}
                                </span>
                            </div>
                        </div>

                        {/* Excerpt */}
                        <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed flex-1 line-clamp-3">
                            {post.excerpt || 'No excerpt available.'}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
                            <span className="text-[12px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
                                    <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                {(post.shares ?? 0).toLocaleString()} shares
                            </span>
                            <span className={`text-[13px] font-semibold flex items-center gap-1.5 transition-all duration-200 underline underline-offset-2 ${
                                hovered ? 'gap-2.5 text-violet-800 dark:text-violet-300' : 'text-violet-600 dark:text-violet-400'
                            }`}>
                                View Post
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Delete modal */}
            {showDeleteModal && (
                <DeleteModal postId={post.id} onCancel={() => setShowDeleteModal(false)} />
            )}
        </>
    );
}