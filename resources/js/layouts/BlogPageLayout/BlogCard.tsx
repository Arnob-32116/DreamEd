import { useState } from "react";
import { Link } from "@inertiajs/react";
import type { BlogPost } from "@/layouts/BlogPageLayout/blogData";

interface Props {
    post: BlogPost;
}

const CATEGORY_COLORS: Record<string, string> = {
    "Study Abroad":  "#2e7d8c",
    "Student Life":  "#3a6ba8",
    "Career":        "#5a4a8a",
    "Programs":      "#2d6a4f",
    "Side Hustle":   "#6b4226",
    "Visa Guide":    "#7a5c2e",
    "Education":     "#4a5568",
    "Scholarship":   "#7b5bb5",
};

const FALLBACK_COLORS: Record<string, string> = {
    "Study Abroad":  "#c9a96e",
    "Student Life":  "#6a8fa8",
    "Career":        "#7a6a5a",
    "Programs":      "#8a9a7a",
    "Side Hustle":   "#3a3a4a",
    "Visa Guide":    "#7a8a9a",
    "Education":     "#b0b0b0",
    "Scholarship":   "#e8c97a",
};

export default function BlogCard({ post }: Props) {
    const [hovered, setHovered]   = useState(false);
    const [imgError, setImgError] = useState(false);

    const categoryColor = CATEGORY_COLORS[post.category] || "#555";
    const fallbackColor = post.imageColor || FALLBACK_COLORS[post.category] || "#c8c8d0";
    const hasImage      = !!(post.cover_image && !imgError);

    // ✅ /blogs/{slug} matches the route exactly (plural, same as web.php)
    const postHref = post.slug ? `/blogs/${post.slug}` : `/blogs/${post.id}`;

    return (
        <Link
            href={postHref}
            className={`
                block bg-white dark:bg-zinc-900
                border border-zinc-200 dark:border-zinc-800
                rounded-2xl overflow-hidden flex flex-col cursor-pointer
                transition-all duration-300 no-underline
                ${hovered
                    ? "shadow-2xl shadow-violet-200/40 dark:shadow-violet-900/30 -translate-y-2 scale-[1.012] border-violet-300 dark:border-violet-700"
                    : "shadow-sm"
                }
            `}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Cover Image */}
            <div
                className="relative h-52 flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: hasImage ? undefined : fallbackColor }}
            >
                {hasImage ? (
                    <img
                        src={post.cover_image!}
                        alt={post.title}
                        className={`w-full h-full object-cover transition-all duration-300 ${hovered ? "scale-105" : "scale-100"}`}
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
                    className="absolute top-3 left-3 text-white text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-sm shadow-md z-10"
                    style={{ backgroundColor: categoryColor }}
                >
                    {post.category}
                </span>

                {/* Image icon */}
                <div className="absolute top-3 right-3 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-sm rounded-lg w-8 h-8 flex items-center justify-center text-zinc-500 dark:text-zinc-300 z-10">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" />
                        <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex flex-col flex-1 gap-3">
                <h3 className={`text-[16px] font-bold leading-snug transition-colors duration-200 ${
                    hovered ? "text-violet-700 dark:text-violet-400" : "text-zinc-800 dark:text-zinc-100"
                }`}>
                    {post.title}
                </h3>

                {/* Author row */}
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
                    {post.excerpt || "No excerpt available."}
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
                        hovered ? "gap-2.5 text-violet-800 dark:text-violet-300" : "text-violet-600 dark:text-violet-400"
                    }`}>
                        View Post
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </div>
            </div>
        </Link>
    );
}
