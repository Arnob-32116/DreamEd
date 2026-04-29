import { useState } from "react";
import type { BlogPost } from "@/layouts/BlogPageLayout/blogData";
import "./BlogCard.css";

interface Props {
  post: BlogPost;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Study Abroad": "#2e7d8c",
  "Student Life": "#3a6ba8",
  "Career": "#5a4a8a",
  "Programs": "#2d6a4f",
  "Side Hustle": "#6b4226",
  "Visa Guide": "#7a5c2e",
  "Education": "#4a5568",
  "Scholarship": "#7b5bb5",
};

export default function BlogCard({ post }: Props) {
  const [hovered, setHovered] = useState(false);
  const categoryColor = CATEGORY_COLORS[post.category] || "#555";

  return (
    <div
      className={`blog-card ${hovered ? "hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Area */}
      <div
        className="blog-card-image"
        style={{ background: post.imageColor || "#ccc" }}
      >
        {!post.image && (
          <div className="image-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
              <path d="M21 15L16 10L5 21" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        <span
          className="category-badge"
          style={{ background: categoryColor }}
        >
          {post.category}
        </span>
        <div className="image-icon-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" />
            <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="blog-card-content">
        <h3 className={`blog-card-title ${hovered ? "hovered" : ""}`}>{post.title}</h3>

        <div className="blog-card-meta">
          <div className="author-avatar" style={{ background: categoryColor }}>
            {post.authorAvatar}
          </div>
          <div className="author-info">
            <span className="author-name">{post.author}</span>
            <span className="post-date-read">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" />
              </svg>
              {post.date} &bull; {post.readTime}
            </span>
          </div>
        </div>

        <p className="blog-card-excerpt">{post.excerpt}</p>

        <div className="blog-card-footer">
          <span className="shares-count">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
              <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" />
            </svg>
            {post.shares.toLocaleString()} shares
          </span>
          <button className="view-post-btn">
            View Post
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
