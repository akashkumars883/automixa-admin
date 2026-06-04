"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Globe, FileText, ArrowLeft } from "lucide-react";
import { createBlogPost, updateBlogPost, deleteBlogPost } from "./actions";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const quillModules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'align': [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    handlers: {
      image: function (this: any) {
        const url = prompt('Enter Image URL:');
        if (url) {
          const quill = this.quill;
          const range = quill.getSelection();
          if (range) {
            quill.insertEmbed(range.index, 'image', url);
          } else {
            quill.insertEmbed(0, 'image', url);
          }
        }
      }
    }
  },
  clipboard: {
    matchVisual: false,
    matchers: [
      [1, function (node: any, delta: any) {
        delta.ops.forEach((op: any) => {
          if (op.attributes) {
            if (op.attributes.background) {
              const bg = String(op.attributes.background).toLowerCase().replace(/\s+/g, '');
              if (
                bg === '#000000' ||
                bg === 'black' ||
                bg === 'rgb(0,0,0)' ||
                bg === 'rgb(9,9,11)' ||
                bg === '#09090b'
              ) {
                delete op.attributes.background;
                if (op.attributes.color) {
                  const color = String(op.attributes.color).toLowerCase().replace(/\s+/g, '');
                  if (
                    color === '#ffffff' ||
                    color === 'white' ||
                    color === 'rgb(255,255,255)' ||
                    color === 'rgb(220,220,220)'
                  ) {
                    delete op.attributes.color;
                  }
                }
              }
            }
          }
        });
        return delta;
      }]
    ]
  }
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  status: string;
  image?: string;
  category?: string;
  author?: string;
}

export default function BlogClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    status: "draft",
    image: "",
    category: "General",
    author: "Automixa Team"
  });

  const handleOpenModal = (post: BlogPost | null = null) => {
    if (post) {
      setEditingId(post.id);
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content,
        status: post.status,
        image: post.image || "",
        category: post.category || "General",
        author: post.author || "Automixa Team"
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        status: "draft",
        image: "",
        category: "General",
        author: "Automixa Team"
      });
    }
    setIsModalOpen(true);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (!editingId) {
      setFormData({ ...formData, title, slug: generateSlug(title) });
    } else {
      setFormData({ ...formData, title });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let res;
    if (editingId) {
      res = await updateBlogPost(editingId, formData);
    } else {
      res = await createBlogPost(formData);
    }

    if (res.success) {
      setIsModalOpen(false);
      window.location.reload(); // Simple refresh for now
    } else {
      alert("Error: " + res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const res = await deleteBlogPost(id);
    if (res.success) {
      setPosts(posts.filter(p => p.id !== id));
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/marketing" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-fuchsia-400" /> Blog Manager
            </h1>
            <p className="mt-1 text-slate-400">Write, edit, and publish SEO-optimized articles.</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-fuchsia-500/20"
        >
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="border border-white/5 bg-white/[0.02] rounded-2xl p-6 hover:border-white/10 transition-colors shadow-xl group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded font-bold ${
                  post.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {post.status}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(post)} className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(post.id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {post.image && (
                <div className="rounded-lg overflow-hidden border border-white/5 aspect-[16/9] mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
              <p className="text-sm text-slate-400 mb-4 line-clamp-3">{post.excerpt || post.content.replace(/<[^>]*>/g, '')}</p>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-2 border-t border-white/5">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                /{post.slug}
              </span>
              {post.category && (
                <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] uppercase tracking-wider text-fuchsia-400">
                  {post.category}
                </span>
              )}
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="col-span-full py-16 text-center border border-white/5 border-dashed rounded-2xl">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No articles yet</h3>
             <p className="text-slate-400">Click &quot;New Article&quot; to start writing your first blog post.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-white z-[100] overflow-hidden flex flex-col blog-editor-modal" style={{ colorScheme: "light" }}>
          {/* Top Navbar for Editor */}
          <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-slate-50">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors text-sm font-medium">
                <ArrowLeft size={16} />
                Back
              </button>
              <div className="h-4 w-[1px] bg-slate-200"></div>
              <span className="text-sm font-medium text-slate-700">{editingId ? "Edit Article" : "Write New Article"}</span>
            </div>
            
            {/* Raw CSS to style Quill editor for premium light mode */}
            <style>{`
              .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid rgba(0,0,0,0.06) !important; background: rgba(255,255,255,0.95) !important; backdrop-filter: blur(10px); border-radius: 12px 12px 0 0 !important; padding: 12px !important; z-index: 10; }
              .ql-container.ql-snow { border: none !important; font-size: 16px; font-family: inherit; flex: 1; overflow-y: auto; background-color: #ffffff !important; }
              .ql-editor { min-height: 100%; padding: 24px; color: #1e293b !important; background-color: #ffffff !important; }
              .ql-snow .ql-stroke { stroke: #475569 !important; }
              .ql-snow .ql-fill, .ql-snow .ql-stroke.ql-fill { fill: #475569 !important; }
              .ql-snow .ql-picker { color: #475569 !important; }
              .ql-snow .ql-picker-options { background: #ffffff !important; border: 1px solid rgba(0,0,0,0.08) !important; color: #1e293b !important; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
              .ql-snow .ql-picker-item:hover, .ql-snow .ql-picker-item.ql-selected { color: #d946ef !important; }
              .ql-snow.ql-toolbar button:hover .ql-stroke, .ql-snow .ql-toolbar button.ql-active .ql-stroke { stroke: #d946ef !important; }
              .ql-snow.ql-toolbar button:hover .ql-fill, .ql-snow .ql-toolbar button.ql-active .ql-fill { fill: #d946ef !important; }
              .ql-editor blockquote { border-left: 4px solid #d946ef; padding-left: 1rem; color: #64748b; font-style: italic; }
              .ql-editor a { color: #d946ef; }

              /* Reset admin-right-side overrides for the editor modal */
              .blog-editor-modal h1,
              .blog-editor-modal h2,
              .blog-editor-modal h3,
              .blog-editor-modal h4,
              .blog-editor-modal h5,
              .blog-editor-modal h6 {
                color: #0f172a !important;
              }
              .blog-editor-modal p,
              .blog-editor-modal span,
              .blog-editor-modal li {
                color: #1e293b !important;
              }
              /* Strip pasted dark background colors and reset text colors */
              .ql-editor [style*="background-color: rgb(9, 9, 11)"],
              .ql-editor [style*="background-color: rgb(9,9,11)"],
              .ql-editor [style*="background-color: rgb(0, 0, 0)"],
              .ql-editor [style*="background-color: rgb(0,0,0)"],
              .ql-editor [style*="background-color: black"],
              .ql-editor [style*="background-color: #000000"],
              .ql-editor [style*="background-color: #000"],
              .ql-editor [style*="background-color: #09090b"],
              .ql-editor [style*="background-color: #09090B"] {
                background-color: transparent !important;
                color: inherit !important;
              }
            `}</style>

            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded font-bold ${
                formData.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {formData.status}
              </span>
              <button onClick={handleSubmit} disabled={loading} className="px-5 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-fuchsia-500/20 transition-all active:scale-95">
                {loading ? "Saving..." : "Save Article"}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex overflow-hidden">
            {/* Main Editor Area (Left) */}
            <div className="flex-1 px-6 md:px-12 lg:px-24 py-12 flex flex-col overflow-hidden bg-slate-50/50">
              <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
                <input 
                  required 
                  value={formData.title} 
                  onChange={handleTitleChange} 
                  className="w-full shrink-0 bg-transparent text-3xl md:text-5xl font-black text-slate-900 placeholder-slate-300 focus:outline-none mb-8 leading-tight" 
                  placeholder="Article Title..." 
                />
                
                <div className="bg-white text-slate-800 rounded-xl flex-1 flex flex-col border border-slate-200 shadow-sm relative z-10 min-h-0">
                  <ReactQuill 
                    theme="snow"
                    value={formData.content} 
                    onChange={(content) => setFormData({...formData, content})}
                    modules={quillModules}
                    className="flex-1 flex flex-col h-full"
                  />
                </div>
              </div>
            </div>

            {/* Settings Sidebar (Right) */}
            <div className="w-96 bg-white border-l border-slate-200 overflow-y-auto p-6 lg:p-8 shrink-0 hidden md:block">
              <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Post Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">URL Slug</label>
                  <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 font-mono focus:outline-none focus:border-fuchsia-500 transition-colors" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Cover Image URL</label>
                  <input type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://images.unsplash.com/..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-fuchsia-500 transition-colors" />
                  {formData.image && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 aspect-[16/9] relative bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.image} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-fuchsia-500 transition-colors">
                    <option value="General">General</option>
                    <option value="Instagram Automation">Instagram Automation</option>
                    <option value="Marketing Tips">Marketing Tips</option>
                    <option value="Product Updates">Product Updates</option>
                    <option value="Creator Growth">Creator Growth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Author Name</label>
                  <input type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-fuchsia-500 transition-colors" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Excerpt</label>
                  <textarea rows={4} value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-fuchsia-500 transition-colors resize-none" placeholder="Short description for SEO..." />
                  <p className="text-[10px] text-slate-500 mt-1.5">Recommended 150-160 characters.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Visibility Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-fuchsia-500 transition-colors">
                    <option value="draft">Draft (Hidden)</option>
                    <option value="published">Published (Live)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
