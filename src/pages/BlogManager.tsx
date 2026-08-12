import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '../components/Toast';

interface BlogPost {
  slug: string;
  title?: string;
  excerpt?: string;
  category?: string;
  date?: string;
  readTime?: string;
  draft?: boolean;
  author?: string;
  tags?: string[];
  body?: string;
}

const CATEGORIES = [
  'Technical SEO',
  'Local SEO',
  'Process',
  'Content Strategy',
  'Reporting',
  'Strategy',
  'AI Search',
];

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  const loadPosts = useCallback(() => {
    setLoading(true);
    fetch('/api/blog')
      .then(r => r.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        showToast('Failed to load blog posts', 'error');
        setLoading(false);
      });
  }, [showToast]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const createNewPost = () => {
    const slug = `new-post-${Date.now()}`;
    const newPost: BlogPost = {
      slug,
      title: '',
      excerpt: '',
      category: 'Technical SEO',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: '5 min read',
      draft: false,
      author: 'GetUsRanked Team',
      tags: ['SEO', 'Search'],
      body: '## Introduction\n\nWrite your blog article in Markdown here...\n\n### Key Takeaways\n- Point 1\n- Point 2\n',
    };
    setEditingPost(newPost);
  };

  const editPost = async (slug: string) => {
    try {
      const res = await fetch(`/api/blog/${slug}`);
      const data = await res.json();
      setEditingPost({
        slug,
        title: data.title || '',
        excerpt: data.excerpt || '',
        category: data.category || 'Technical SEO',
        date: data.date || '',
        readTime: data.readTime || '5 min read',
        draft: data.draft ?? false,
        author: data.author || 'GetUsRanked Team',
        tags: Array.isArray(data.tags) ? data.tags : [],
        body: data.body || '',
      });
    } catch {
      showToast('Failed to load post content', 'error');
    }
  };

  const savePost = async () => {
    if (!editingPost) return;
    setSaving(true);
    try {
      const { slug, body, ...frontmatter } = editingPost;
      const res = await fetch(`/api/blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frontmatter, body }),
      });
      if (res.ok) {
        showToast('Blog post saved successfully');
        setEditingPost(null);
        loadPosts();
      } else {
        showToast('Failed to save post', 'error');
      }
    } catch {
      showToast('Failed to save post', 'error');
    }
    setSaving(false);
  };

  const deletePost = async (post: BlogPost) => {
    const postTitle = post.title || post.slug;
    if (!window.confirm(`Delete '${postTitle}'? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/blog/${post.slug}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast('Post deleted from disk');
        if (editingPost?.slug === post.slug) setEditingPost(null);
        loadPosts();
      } else {
        showToast(data.error || 'Failed to delete post from disk', 'error');
      }
    } catch {
      showToast('Failed to delete post', 'error');
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current || !editingPost) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editingPost.body || '';
    const selectedText = text.substring(start, end) || 'text';
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newBody = text.substring(0, start) + replacement + text.substring(end);

    setEditingPost({ ...editingPost, body: newBody });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const renderMarkdownPreview = (md: string) => {
    if (!md) return '';
    let html = md
      .replace(/^### (.*$)/gim, '<h3 style="font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; margin: 1.5rem 0 0.5rem; color: var(--cms-ink);">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; margin: 1.75rem 0 0.75rem; color: var(--cms-ink);">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; margin: 2rem 0 1rem; color: var(--cms-ink);">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background: rgba(19,22,28,0.06); padding: 2px 6px; border-radius: 2px; font-family: var(--font-mono); font-size: 0.85rem;">$1</code>')
      .replace(/^\s*-\s+(.*$)/gim, '<li style="margin-left: 1.25rem; list-style-type: disc;">$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: var(--cms-blue); text-decoration: underline;">$1</a>')
      .replace(/\n\n/g, '<br/><br/>');
    return html;
  };

  return (
    <div>
      <div className="cms-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="cms-eyebrow">[ CONTENT MANAGEMENT ]</span>
          <h1>Blog Articles</h1>
          <p>Create, edit, and publish markdown articles and frontmatter metadata</p>
        </div>
        {!editingPost && (
          <button className="cms-btn cms-btn-primary" onClick={createNewPost}>
            + Create New Post
          </button>
        )}
      </div>

      {editingPost ? (
        <div className="cms-card">
          <div className="cms-card-header">
            <span className="cms-card-title">Editing: {editingPost.title || editingPost.slug}</span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', background: '#FFFFFF', padding: '2px', borderRadius: '2px', border: '1px solid var(--cms-line-strong)' }}>
                <button className={`cms-btn cms-btn-sm ${viewMode === 'edit' ? 'cms-btn-primary' : 'cms-btn-ghost'}`} onClick={() => setViewMode('edit')}>Code</button>
                <button className={`cms-btn cms-btn-sm ${viewMode === 'split' ? 'cms-btn-primary' : 'cms-btn-ghost'}`} onClick={() => setViewMode('split')}>Split</button>
                <button className={`cms-btn cms-btn-sm ${viewMode === 'preview' ? 'cms-btn-primary' : 'cms-btn-ghost'}`} onClick={() => setViewMode('preview')}>Preview</button>
              </div>
              <button className="cms-btn cms-btn-ghost" onClick={() => setEditingPost(null)}>Cancel</button>
              <button className="cms-btn cms-btn-primary" onClick={savePost} disabled={saving}>
                {saving ? <span className="cms-spinner" /> : null}
                {saving ? 'Saving...' : 'Save Post'}
              </button>
            </div>
          </div>

          <div className="cms-form-row">
            <div className="cms-form-group">
              <label className="cms-label">URL Slug (Filename)</label>
              <input className="cms-input" value={editingPost.slug} onChange={e => setEditingPost({ ...editingPost, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} />
            </div>
            <div className="cms-form-group">
              <label className="cms-label">Publication Status</label>
              <select
                className="cms-select"
                value={editingPost.draft ? 'draft' : 'published'}
                onChange={e => setEditingPost({ ...editingPost, draft: e.target.value === 'draft' })}
              >
                <option value="published">Published (Visible on website)</option>
                <option value="draft">Draft (Hidden from website)</option>
              </select>
            </div>
          </div>

          <div className="cms-form-group">
            <label className="cms-label">Article Category</label>
            <select className="cms-select" value={editingPost.category} onChange={e => setEditingPost({ ...editingPost, category: e.target.value })}>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="cms-form-group">
            <label className="cms-label">Article Title</label>
            <input className="cms-input" value={editingPost.title} onChange={e => setEditingPost({ ...editingPost, title: e.target.value })} />
          </div>

          <div className="cms-form-group">
            <label className="cms-label">Excerpt / Short Summary</label>
            <textarea className="cms-textarea" rows={2} value={editingPost.excerpt} onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })} />
          </div>

          <div className="cms-form-row">
            <div className="cms-form-group">
              <label className="cms-label">Publication Date</label>
              <input className="cms-input" value={editingPost.date} onChange={e => setEditingPost({ ...editingPost, date: e.target.value })} />
            </div>
            <div className="cms-form-group">
              <label className="cms-label">Estimated Read Time</label>
              <input className="cms-input" value={editingPost.readTime} onChange={e => setEditingPost({ ...editingPost, readTime: e.target.value })} />
            </div>
          </div>

          <div className="cms-form-row">
            <div className="cms-form-group">
              <label className="cms-label">Author Name</label>
              <input className="cms-input" value={editingPost.author} onChange={e => setEditingPost({ ...editingPost, author: e.target.value })} />
            </div>
            <div className="cms-form-group">
              <label className="cms-label">Tags (Comma Separated)</label>
              <input className="cms-input" value={editingPost.tags?.join(', ') || ''} onChange={e => setEditingPost({ ...editingPost, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
            </div>
          </div>

          {/* Markdown Toolbar */}
          <div className="cms-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="cms-label" style={{ marginBottom: 0 }}>Article Markdown Content</label>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => insertMarkdown('## ')}>H2</button>
                <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => insertMarkdown('### ')}>H3</button>
                <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => insertMarkdown('**', '**')}><b>B</b></button>
                <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => insertMarkdown('*', '*')}><i>I</i></button>
                <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => insertMarkdown('- ')}>List</button>
                <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => insertMarkdown('`', '`')}>Code</button>
                <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => insertMarkdown('[', '](https://)')}>Link</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'split' ? '1fr 1fr' : '1fr', gap: '1rem' }}>
              {(viewMode === 'edit' || viewMode === 'split') && (
                <textarea
                  ref={textareaRef}
                  className="cms-textarea"
                  style={{ fontFamily: 'var(--font-mono)', minHeight: '400px', fontSize: '0.88rem' }}
                  value={editingPost.body}
                  onChange={e => setEditingPost({ ...editingPost, body: e.target.value })}
                />
              )}

              {(viewMode === 'preview' || viewMode === 'split') && (
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--cms-line-strong)',
                    borderRadius: '2px',
                    padding: '1.5rem',
                    minHeight: '400px',
                    maxHeight: '600px',
                    overflowY: 'auto',
                    lineHeight: '1.7',
                    fontSize: '0.92rem',
                    color: 'var(--cms-ink)',
                  }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(editingPost.body || '') }}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="cms-card">
          {loading ? (
            <div style={{ color: 'var(--cms-ink-soft)', padding: '1rem', fontFamily: 'var(--font-mono)' }}>Loading blog articles...</div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <p style={{ color: 'var(--cms-ink-soft)', marginBottom: '1rem' }}>No blog articles found in <code>src/content/blog/</code></p>
              <button className="cms-btn cms-btn-primary" onClick={createNewPost}>
                + Create First Article
              </button>
            </div>
          ) : (
            <div>
              {posts.map((post, idx) => (
                <div key={post.slug} className="cms-array-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontFamily: 'var(--font-numeral)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--cms-blue)' }}>
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--cms-ink)' }}>
                        {post.title || post.slug}
                      </span>
                      <span className={`cms-card-badge ${post.draft ? 'gold' : 'green'}`}>
                        {post.draft ? 'Draft' : 'Published'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--cms-ink-soft)', fontFamily: 'var(--font-mono)' }}>
                      Category: <span style={{ color: 'var(--cms-blue)', fontWeight: 600 }}>{post.category || 'General'}</span> • Date: {post.date || 'Draft'}
                    </div>
                  </div>
                  <div className="cms-array-item-actions" style={{ gap: '0.5rem' }}>
                    <button className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => editPost(post.slug)}>Edit Article</button>
                    <button className="cms-icon-btn danger" title="Delete Post" onClick={() => deletePost(post)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
