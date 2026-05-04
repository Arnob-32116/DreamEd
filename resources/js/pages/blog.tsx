import { Head, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import type { BlogPost } from '@/layouts/BlogPageLayout/blogData';
import BlogCard from '@/layouts/BlogPageLayout/BlogCard';
import WriteBlogModal from '@/layouts/BlogPageLayout/WriteBlogModal';
import type { BlogFormData } from '@/layouts/BlogPageLayout/WriteBlogModal';

interface BlogPageProps {
    posts: BlogPost[];
    categories: string[];
    [key: string]: unknown;
}

export default function BlogPage() {
    const { posts, categories } = usePage<BlogPageProps>().props;

    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery]       = useState('');
    const [showModal, setShowModal]           = useState(false);

    const filtered = useMemo(() => {
        return posts.filter((post) => {
            const matchCat    = activeCategory === 'All' || post.category === activeCategory;
            const matchSearch = searchQuery === '' ||
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.author.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCat && matchSearch;
        });
    }, [posts, activeCategory, searchQuery]);

    function handlePublish(data: BlogFormData) {
        const { coverImage, ...restData } = data;
        router.post('/blogs', {
            ...restData,
            cover_image: coverImage,
            status: 'published',
        }, {
            onSuccess: () => setShowModal(false),
        });
    }

    return (
        <>
            <Head title="Blog" />

            <main className="flex-1 flex flex-col overflow-y-auto bg-[#f9f9f9] dark:bg-slate-950 min-h-screen">

                {/* Hero */}
                <section className="bg-[#f5ede0] dark:bg-slate-900 px-6 sm:px-16 py-12 flex flex-col items-center text-center gap-5 border-b border-[#ecdfd0] dark:border-slate-800">
                    <p className="text-[#c0392b] dark:text-red-400 text-[11.5px] font-bold tracking-[2.5px] uppercase">
                        Spread Knowledge, Experience and Ideas
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                        The more you know, the more you learn
                    </h1>
                    <div className="flex flex-col items-center gap-4 w-full max-w-xl">
                        <div className="w-full bg-white dark:bg-slate-800 rounded-full flex items-center px-4 h-12 shadow-sm gap-3 border border-transparent dark:border-slate-700 focus-within:ring-2 focus-within:ring-violet-200 dark:focus-within:ring-violet-800 transition-all">
                            <svg className="shrink-0 text-slate-400" width="17" height="17" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                                <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search blogs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-[14.5px] text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600"
                            />
                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                    <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
                                    <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 active:bg-violet-900 text-white px-7 py-3 rounded-full text-[14.5px] font-semibold shadow-lg shadow-violet-200 dark:shadow-violet-900/40 transition-all hover:-translate-y-px active:translate-y-0"
                        >
                            Write A Blog
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </section>

                {/* Filter Bar */}
                <div className="sticky top-0 z-10 bg-[#f9f9f9]/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 sm:px-10 pt-4 pb-0">
                    <div className="flex gap-2 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-medium border transition-all duration-150 ${
                                    activeCategory === cat
                                        ? 'bg-slate-800 dark:bg-violet-600 border-slate-800 dark:border-violet-600 text-white font-semibold'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-600 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <section className="px-6 sm:px-10 py-9 pb-16">
                    {filtered.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 dark:text-slate-600">
                            <svg className="w-14 h-14 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p className="text-base font-medium">No blogs found matching your search.</p>
                            <p className="text-sm mt-1">Try a different category or search term.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filtered.map((post) => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {showModal && (
                <WriteBlogModal
                    onClose={() => setShowModal(false)}
                    onPublish={handlePublish}
                />
            )}
        </>
    );
}
