import { useState, useRef, useCallback, useEffect } from "react";
import { X, AlignLeft, Eye, Upload, Link, Save, Send, ImageIcon, ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/layouts/BlogPageLayout/blogData";

interface Props {
    onClose: () => void;
    onPublish?: (data: BlogFormData) => void;
}

export interface BlogFormData {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    coverImage: string | null;
}

export default function WriteBlogModal({ onClose, onPublish }: Props) {
    const [tab, setTab]                     = useState<"write" | "preview">("write");
    const [title, setTitle]                 = useState("");
    const [excerpt, setExcerpt]             = useState("");
    const [content, setContent]             = useState("");
    const [category, setCategory]           = useState("");
    const [imageUrl, setImageUrl]           = useState("");
    const [coverPreview, setCoverPreview]   = useState<string | null>(null);
    const [dragOver, setDragOver]           = useState(false);
    const [categoryOpen, setCategoryOpen]   = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const handleFileChange = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => setCoverPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange(file);
    }, []);

    const handleImageUrl = () => {
        if (imageUrl.trim()) setCoverPreview(imageUrl.trim());
    };

    const handlePublish = () => {
        if (!title || !content || !category) return;
        onPublish?.({ title, excerpt, content, category, coverImage: coverPreview });
    };

    const cats = CATEGORIES.filter((c) => c !== "All");
    const canPublish = !!(title && content && category);

    return (
        <div
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[1000] flex items-center justify-center p-6 animate-fade-in"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-modal-in border border-slate-200 dark:border-slate-700">

                {/* Header */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            T
                        </div>
                        <div>
                            <h2 className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">Write a Blog Post</h2>
                            <p className="text-[12.5px] text-slate-400 dark:text-slate-500 mt-0.5">Share your knowledge and experiences</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* Tab toggle */}
                <div className="flex mx-7 mt-4 bg-slate-100 dark:bg-slate-800 rounded-full p-1 w-fit shrink-0">
                    {[
                        { key: "write", icon: <AlignLeft size={14} />, label: "Write" },
                        { key: "preview", icon: <Eye size={14} />, label: "Preview" },
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key as "write" | "preview")}
                            className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-[13.5px] font-medium transition-all ${
                                tab === t.key
                                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold shadow-sm"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            }`}
                        >
                            {t.icon}{t.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-7 py-5 scrollbar-thin">
                    {tab === "write" ? (
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                            {/* Left */}
                            <div className="flex flex-col gap-5">
                                {/* Title */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                                        Blog Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter an engaging title..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[14px] text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 placeholder-slate-300 dark:placeholder-slate-600 transition-all"
                                    />
                                </div>

                                {/* Excerpt */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Short Excerpt</label>
                                    <textarea
                                        placeholder="Write a brief summary (shown in blog cards)..."
                                        rows={3}
                                        maxLength={200}
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[14px] text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 placeholder-slate-300 dark:placeholder-slate-600 resize-none leading-relaxed transition-all"
                                    />
                                    <span className="text-[11.5px] text-slate-400 text-right">{excerpt.length}/200</span>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                                        Blog Content <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        placeholder="Write your blog content here..."
                                        rows={10}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[14px] text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 placeholder-slate-300 dark:placeholder-slate-600 resize-y leading-relaxed transition-all min-h-[200px]"
                                    />
                                </div>
                            </div>

                            {/* Right sidebar */}
                            <div className="flex flex-col gap-4">
                                {/* Category */}
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col gap-3">
                                    <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div
                                            onClick={() => setCategoryOpen(!categoryOpen)}
                                            className="flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:border-violet-300 dark:hover:border-violet-600 transition-colors select-none"
                                        >
                                            <span className={`text-[13.5px] ${category ? "text-slate-800 dark:text-slate-100 font-medium" : "text-slate-400 dark:text-slate-600"}`}>
                                                {category || "Select category"}
                                            </span>
                                            <ChevronDown size={15} className={`text-slate-400 transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`} />
                                        </div>
                                        {categoryOpen && (
                                            <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-52 overflow-y-auto">
                                                {cats.map((cat) => (
                                                    <div
                                                        key={cat}
                                                        onClick={(e) => { e.stopPropagation(); setCategory(cat); setCategoryOpen(false); }}
                                                        className={`px-4 py-2.5 text-[13px] cursor-pointer transition-colors ${
                                                            category === cat
                                                                ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-semibold"
                                                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                                        }`}
                                                    >
                                                        {cat}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Cover Image */}
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col gap-3">
                                    <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <ImageIcon size={13} strokeWidth={1.8} /> Cover Image
                                    </label>

                                    {coverPreview ? (
                                        <div className="relative rounded-xl overflow-hidden">
                                            <img src={coverPreview} alt="Cover" className="w-full h-36 object-cover" />
                                            <button
                                                onClick={() => setCoverPreview(null)}
                                                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
                                            >
                                                <X size={12} /> Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                                onDragLeave={() => setDragOver(false)}
                                                onDrop={handleDrop}
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`border-2 border-dashed rounded-xl py-5 px-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                                                    dragOver
                                                        ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                                        : "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400"
                                                }`}
                                            >
                                                <Upload size={18} strokeWidth={1.5} className="text-blue-400" />
                                                <span className="text-[13px] font-semibold text-blue-500">Upload from PC</span>
                                                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} />
                                            </div>

                                            <div className="text-center text-[12px] text-slate-400">or</div>

                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter image URL..."
                                                    value={imageUrl}
                                                    onChange={(e) => setImageUrl(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && handleImageUrl()}
                                                    className="flex-1 text-[12.5px] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:border-violet-400 placeholder-slate-300 dark:placeholder-slate-600 transition-all"
                                                />
                                                <button
                                                    onClick={handleImageUrl}
                                                    className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors shrink-0"
                                                >
                                                    <Link size={13} />
                                                </button>
                                            </div>
                                            <p className="text-[11px] text-slate-400">Recommended: 1200x600px, Max 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Preview */
                        <div className="max-w-2xl mx-auto pb-5">
                            {coverPreview && (
                                <img src={coverPreview} alt="Cover" className="w-full h-64 object-cover rounded-2xl mb-5" />
                            )}
                            {category && (
                                <span className="inline-block bg-violet-600 text-white text-[12px] font-semibold px-3 py-1 rounded-full mb-4">
                                    {category}
                                </span>
                            )}
                            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight mb-4 tracking-tight">
                                {title || <span className="text-slate-300 dark:text-slate-600 italic">No title yet...</span>}
                            </h1>
                            {excerpt && (
                                <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed border-l-4 border-violet-300 dark:border-violet-700 pl-4 mb-5 italic">
                                    {excerpt}
                                </p>
                            )}
                            <div className="text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed">
                                {content
                                    ? content.split("\n").map((p, i) => p ? <p key={i} className="mb-3">{p}</p> : <br key={i} />)
                                    : <span className="text-slate-300 dark:text-slate-600 italic">No content yet...</span>
                                }
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2 text-[13px] text-slate-400 dark:text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        Auto-saving enabled
                    </div>
                    <div className="flex gap-2.5">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-[13.5px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Save size={14} /> Save Draft
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={!canPublish}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all shadow-md ${
                                canPublish
                                    ? "bg-violet-600 hover:bg-violet-700 active:bg-violet-800 shadow-violet-200 dark:shadow-violet-900/50 hover:-translate-y-px"
                                    : "bg-violet-300 dark:bg-violet-900 cursor-not-allowed opacity-50"
                            }`}
                        >
                            <Send size={14} /> Publish Blog
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
