import { useState } from "react";
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

export default function BlogCard({ post }: Props) {
    const [hovered, setHovered] = useState(false);
    const categoryColor = CATEGORY_COLORS[post.category] || "#555";

    return (
        <div
            className={`
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                rounded-2xl overflow-hidden flex flex-col cursor-pointer
                transition-all duration-300
                ${hovered
                    ? "shadow-2xl shadow-violet-200/40 dark:shadow-violet-900/30 -translate-y-2 scale-[1.012] border-violet-300 dark:border-violet-600"
                    : "shadow-sm hover:shadow-md"
                }
            `}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image Area */}
            <div
                className={`relative h-52 flex items-center justify-center overflow-hidden transition-all duration-300 ${hovered ? 'brightness-105' : ''}`}
                style={{ background: post.cover_image ? undefined : (post.imageColor || "#ccc") }}
            >
                {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="opacity-40">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                            <circle cx="8.5" cy="8.5" r="1.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                            <path d="M21 15L16 10L5 21" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                    </div>
                )}

                {/* Category badge */}
                <span
                    className="absolute top-3 left-3 text-white text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-sm shadow-md"
                    style={{ backgroundColor: categoryColor }}
                >
                    {post.category}
                </span>

                {/* Image icon */}
                <div className="absolute top-3 right-3 bg-white/85 dark:bg-slate-800/85 backdrop-blur-sm rounded-lg w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-300 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" />
                        <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1 gap-3">
                <h3 className={`text-[16.5px] font-bold leading-snug transition-colors duration-200 ${
                    hovered ? "text-violet-700 dark:text-violet-400" : "text-slate-800 dark:text-slate-100"
                }`}>
                    {post.title}
                </h3>

                {/* Author meta */}
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                        style={{ backgroundColor: categoryColor }}
                    >
                        {post.authorAvatar}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{post.author}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            {post.date} &bull; {post.readTime}
                        </span>
                    </div>
                </div>

                {/* Excerpt */}
                <p className="text-[13.5px] text-slate-500 dark:text-slate-400 leading-relaxed flex-1 line-clamp-3">
                    {post.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 mt-auto">
                    <span className="text-[12.5px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
                            <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
                            <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {post.shares.toLocaleString()} shares
                    </span>
                    <button className={`text-[13px] font-semibold flex items-center gap-1.5 transition-all duration-200 underline underline-offset-2 ${
                        hovered ? "gap-2.5 text-violet-800 dark:text-violet-300" : "text-violet-600 dark:text-violet-400"
                    }`}>
                        View Post
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
