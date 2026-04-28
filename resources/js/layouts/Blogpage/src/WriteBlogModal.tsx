
import { useState, useRef, useCallback } from "react";
import {
  X,
  AlignLeft,
  Eye,
  Upload,
  Link,
  Save,
  Send,
  ImageIcon,
  ChevronDown,
} from "lucide-react";
import { CATEGORIES } from "../data/blogData";
import "./WriteBlogModal.css";

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
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    onClose();
  };

  const cats = CATEGORIES.filter((c) => c !== "All");

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-avatar">T</div>
            <div>
              <h2 className="modal-title">Write a Blog Post</h2>
              <p className="modal-subtitle">Share your knowledge and experiences</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        
        <div className="tab-toggle">
          <button
            className={`tab-btn ${tab === "write" ? "active" : ""}`}
            onClick={() => setTab("write")}
          >
            <AlignLeft size={15} />
            Write
          </button>
          <button
            className={`tab-btn ${tab === "preview" ? "active" : ""}`}
            onClick={() => setTab("preview")}
          >
            <Eye size={15} />
            Preview
          </button>
        </div>

        
        <div className="modal-body">
          {tab === "write" ? (
            <div className="write-layout">
              
              <div className="write-left">
               
                <div className="field-group">
                  <label className="field-label">
                    Blog Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Enter an engaging title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                
                <div className="field-group">
                  <label className="field-label">Short Excerpt</label>
                  <textarea
                    className="field-textarea"
                    placeholder="Write a brief summary (shown in blog cards)..."
                    rows={4}
                    maxLength={200}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                  />
                  <span className="char-count">{excerpt.length}/200 characters</span>
                </div>

                
                <div className="field-group">
                  <label className="field-label">
                    Blog Content <span className="required">*</span>
                  </label>
                  <textarea
                    className="field-textarea content-textarea"
                    placeholder="Write your blog content here... Share your experiences, tips, and insights."
                    rows={10}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              </div>

              
              <div className="write-right">
                
                <div className="sidebar-card">
                  <label className="field-label">
                    Category <span className="required">*</span>
                  </label>
                  <div className="custom-select" onClick={() => setCategoryOpen(!categoryOpen)}>
                    <span className={category ? "select-value" : "select-placeholder"}>
                      {category || "Select category"}
                    </span>
                    <ChevronDown size={16} className={`select-chevron ${categoryOpen ? "open" : ""}`} />
                    {categoryOpen && (
                      <div className="select-dropdown">
                        {cats.map((cat) => (
                          <div
                            key={cat}
                            className={`select-option ${category === cat ? "selected" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategory(cat);
                              setCategoryOpen(false);
                            }}
                          >
                            {cat}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                
                <div className="sidebar-card">
                  <label className="field-label">
                    <ImageIcon size={15} strokeWidth={1.8} />
                    Cover Image
                  </label>

                  {coverPreview ? (
                    <div className="cover-preview">
                      <img src={coverPreview} alt="Cover" />
                      <button className="remove-cover" onClick={() => setCoverPreview(null)}>
                        <X size={14} /> Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={20} strokeWidth={1.5} className="upload-icon" />
                        <span className="upload-label">Upload from PC</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                        />
                      </div>

                      <div className="or-divider">or</div>

                      <div className="url-row">
                        <input
                          type="text"
                          className="field-input url-input"
                          placeholder="Enter image URL..."
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleImageUrl()}
                        />
                        <button className="url-go-btn" onClick={handleImageUrl}>
                          <Link size={14} />
                        </button>
                      </div>

                      <p className="upload-hint">Recommended: 1200x600px, Max 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            
            <div className="preview-pane">
              {coverPreview && (
                <img src={coverPreview} alt="Cover" className="preview-cover" />
              )}
              {category && <span className="preview-category-badge">{category}</span>}
              <h1 className="preview-title">{title || <span className="preview-empty">No title yet...</span>}</h1>
              {excerpt && <p className="preview-excerpt">{excerpt}</p>}
              <div className="preview-content">
                {content
                  ? content.split("\n").map((p, i) => p ? <p key={i}>{p}</p> : <br key={i} />)
                  : <span className="preview-empty">No content yet...</span>
                }
              </div>
            </div>
          )}
        </div>

        
        <div className="modal-footer">
          <div className="autosave-indicator">
            <span className="autosave-dot" />
            Auto-saving enabled
          </div>
          <div className="footer-actions">
            <button className="btn-draft" onClick={onClose}>
              <Save size={15} />
              Save Draft
            </button>
            <button
              className={`btn-publish ${!title || !content || !category ? "disabled" : ""}`}
              onClick={handlePublish}
            >
              <Send size={15} />
              Publish Blog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
