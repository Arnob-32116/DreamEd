import { useState, useMemo } from "react";
import { BLOG_POSTS, CATEGORIES } from "@/layouts/BlogPageLayout/blogData";
import BlogCard from "./BlogCard";
import WriteBlogModal from "@/layouts/BlogPageLayout/WriteBlogModal";
import "./BlogPage.css";

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchCat = activeCategory === "All" || post.category === activeCategory;
      const matchSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <main className="blog-main">
      {/* Hero Section */}
      <section className="blog-hero">
        <p className="hero-tagline">SPREAD KNOWLEDGE, EXPERIENCE AND IDEAS</p>
        <h1 className="hero-title">The more you know, the more you learn</h1>
        <div className="hero-search-row">
          <div className="search-box">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#aaa" strokeWidth="2" />
              <path d="M20 20L16.65 16.65" stroke="#aaa" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="mic-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" stroke="#aaa" strokeWidth="2" />
                <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" stroke="#aaa" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <button className="write-btn" onClick={() => setShowModal(true)}>
            Write A Blog
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="blog-filter-bar">
        <div className="filter-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Blog Grid */}
      <section className="blog-grid-section">
        {filtered.length === 0 ? (
          <div className="no-results">
            <p>No blogs found matching your search.</p>
          </div>
        ) : (
          <div className="blog-grid">
            {filtered.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <WriteBlogModal onClose={() => setShowModal(false)} />
      )}
    </main>
  );
}
