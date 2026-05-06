import { useState, useRef, useCallback, useEffect } from "react";
import { X, AlignLeft, Eye, Upload, Link, Save, Send, ImageIcon, ChevronDown, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/layouts/BlogPageLayout/blogData";

interface Props {
    onClose: () => void;
    onPublish?: (data: BlogFormData) => void;
    submitting?: boolean;
}

export interface BlogFormData {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    coverImageFile: File | null;
    coverImageUrl: string;
}

export default function WriteBlogModal({ onClose, onPublish, submitting = false }: Props) {
    const [tab, setTab]                   = useState<"write" | "preview">("write");
    const [title, setTitle]               = useState("");
    const [excerpt, setExcerpt]           = useState("");
    const [content, setContent]           = useState("");
    const [category, setCategory]         = useState("");
    const [imageUrl, setImageUrl]         = useState("");
    const [coverFile, setCoverFile]       = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [dragOver, setDragOver]         = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !submitting) onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose, submitting]);

    const handleFileChange = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        if (file.size > 5 * 1024 * 1024) {
            alert("Image must be under 5MB");
            return;
        }
        setCoverFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setCoverPreview(e.target?.result as string);
        reader.readAsDataURL(file);
        setImageUrl("");
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange(file);
    }, []);

    const handleImageUrl = () => {
        const url = imageUrl.trim();
        if (!url) return;
        setCoverPreview(url);
        setCoverFile(null);
    };

    const handleRemoveCover = () => {
        setCoverPreview(null);
        setCoverFile(null);
        setImageUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePublish = () => {
        if (!title.trim() || !content.trim() || !category || submitting) return;
        onPublish?.({
            title:          title.trim(),
            excerpt:        excerpt.trim(),
            content:        content.trim(),
            category,
            coverImageFile: coverFile,
            coverImageUrl:  coverFile ? "" : imageUrl.trim(),
        });
    };

    const cats = CATEGORIES.filter((c) => c !== "All");
    const canPublish = !!(title.trim() && content.trim() && category) && !submitting;

    return (
        <div
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 sm:p-6"
            onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}
        >
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white font-bold text-base shrink-0">
                            ✍
                        </div>
                        <div>
                            <h2 className="text-[17px] font-bold text-slate-800 dark:text-slate-100">Write a Blog Post</h2>
                            <p className="text-[12px] text-slate-400 dark:text-slate-500">Share your knowledge and experiences</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { if (!submitting) onClose(); }}
                        disabled={submitting}
                        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* ── Tab toggle ── */}
                <div className="flex mx-6 mt-4 bg-slate-100 dark:bg-slate-800 rounded-full p-1 w-fit shrink-0">
                    {([
                        { key: "write",   icon: <AlignLeft size={13} />, label: "Write"   },
                        { key: "preview", icon: <Eye size={13} />,       label: "Preview" },
                    ] as const).map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                                tab === t.key
                                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold shadow-sm"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            }`}
                        >
                            {t.icon}{t.label}
                        </button>
                    ))}
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {tab === "write" ? (
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

                            {/* Left — main fields */}
                            <div className="flex flex-col gap-4">

                                {/* Title */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-300">
                                        Blog Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter an engaging title..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        disabled={submitting}
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-[13.5px] text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 placeholder-slate-300 dark:placeholder-slate-600 transition-all disabled:opacity-60"
                                    />
                                </div>

                                {/* Excerpt */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-300">
                                        Short Excerpt <span className="text-slate-400 font-normal">(shown on card)</span>
                                    </label>
                                    <textarea
                                        placeholder="Write a brief summary..."
                                        rows={2}
                                        maxLength={500}
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        disabled={submitting}
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-[13.5px] text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 placeholder-slate-300 dark:placeholder-slate-600 resize-none transition-all disabled:opacity-60"
                                    />
                                    <span className="text-[11px] text-slate-400 text-right">{excerpt.length}/500</span>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-300">
                                        Blog Content <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        placeholder="Write your blog content here..."
                                        rows={12}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        disabled={submitting}
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-[13.5px] text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 placeholder-slate-300 dark:placeholder-slate-600 resize-y leading-relaxed transition-all min-h-[200px] disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            {/* Right sidebar */}
                            <div className="flex flex-col gap-4">

                                {/* Category */}
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col gap-2">
                                    <label className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-300">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div
                                            onClick={() => !submitting && setCategoryOpen(!categoryOpen)}
                                            className={`flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:border-violet-300 dark:hover:border-violet-600 transition-colors select-none ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            <span className={`text-[13px] ${category ? "text-slate-800 dark:text-slate-100 font-medium" : "text-slate-400 dark:text-slate-600"}`}>
                                                {category || "Select category..."}
                                            </span>
                                            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`} />
                                        </div>
                                        {categoryOpen && (
                                            <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
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
                                    <label className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <ImageIcon size={12} strokeWidth={1.8} /> Cover Image
                                        <span className="text-slate-400 font-normal">(optional)</span>
                                    </label>

                                    {coverPreview ? (
                                        <div className="relative rounded-xl overflow-hidden">
                                            <img src={coverPreview} alt="Cover preview" className="w-full h-32 object-cover" />
                                            {coverFile && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                                                    <p className="text-white text-[10px] truncate">{coverFile.name}</p>
                                                </div>
                                            )}
                                            <button
                                                onClick={handleRemoveCover}
                                                disabled={submitting}
                                                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1 transition-colors disabled:opacity-40"
                                            >
                                                <X size={11} /> Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Drag & drop upload */}
                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                                onDragLeave={() => setDragOver(false)}
                                                onDrop={handleDrop}
                                                onClick={() => !submitting && fileInputRef.current?.click()}
                                                className={`border-2 border-dashed rounded-xl py-4 px-3 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                                                    dragOver
                                                        ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                                        : "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400"
                                                } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <Upload size={16} strokeWidth={1.5} className="text-blue-400" />
                                                <span className="text-[12.5px] font-semibold text-blue-500">Upload Image</span>
                                                <span className="text-[11px] text-slate-400">PNG, JPG, WEBP · max 5MB</span>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    hidden
                                                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                                                />
                                            </div>

                                            <div className="text-center text-[11.5px] text-slate-400">or paste a URL</div>

                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="https://example.com/image.jpg"
                                                    value={imageUrl}
                                                    onChange={(e) => setImageUrl(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && handleImageUrl()}
                                                    disabled={submitting}
                                                    className="flex-1 text-[12px] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:border-violet-400 placeholder-slate-300 dark:placeholder-slate-600 transition-all disabled:opacity-60"
                                                />
                                                <button
                                                    onClick={handleImageUrl}
                                                    disabled={submitting}
                                                    className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 transition-colors shrink-0 disabled:opacity-40"
                                                >
                                                    <Link size={13} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── Preview tab ── */
                        <div className="max-w-2xl mx-auto pb-5">
                            {coverPreview && (
                                <img src={coverPreview} alt="Cover" className="w-full h-56 object-cover rounded-2xl mb-5" />
                            )}
                            {category && (
                                <span className="inline-block bg-violet-600 text-white text-[12px] font-semibold px-3 py-1 rounded-full mb-3">
                                    {category}
                                </span>
                            )}
                            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight mb-3">
                                {title || <span className="text-slate-300 italic">No title yet...</span>}
                            </h1>
                            {excerpt && (
                                <p className="text-base text-slate-500 dark:text-slate-400 border-l-4 border-violet-300 pl-4 mb-4 italic">
                                    {excerpt}
                                </p>
                            )}
                            <div className="text-[14.5px] text-slate-700 dark:text-slate-300 leading-relaxed">
                                {content
                                    ? content.split("\n").map((p, i) =>
                                        p.trim() ? <p key={i} className="mb-3">{p}</p> : <br key={i} />
                                      )
                                    : <span className="text-slate-300 italic">No content yet...</span>
                                }
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2 text-[12.5px] text-slate-400 dark:text-slate-500">
                        {submitting ? (
                            <>
                                <Loader2 size={13} className="animate-spin text-violet-500" />
                                <span className="text-violet-500 font-medium">Publishing...</span>
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                Ready to publish
                            </>
                        )}
                    </div>
                    <div className="flex gap-2.5">
                        <button
                            onClick={() => { if (!submitting) onClose(); }}
                            disabled={submitting}
                            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Save size={13} /> Cancel
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={!canPublish}
                            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all shadow-md ${
                                canPublish
                                    ? "bg-violet-600 hover:bg-violet-700 active:bg-violet-800 shadow-violet-200 dark:shadow-violet-900/40 hover:-translate-y-px"
                                    : "bg-violet-300 dark:bg-violet-900/40 cursor-not-allowed opacity-50"
                            }`}
                        >
                            {submitting
                                ? <><Loader2 size={13} className="animate-spin" /> Publishing...</>
                                : <><Send size={13} /> Publish Blog</>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
