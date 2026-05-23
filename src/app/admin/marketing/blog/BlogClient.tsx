"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Globe, FileText, ArrowLeft } from "lucide-react";
import { createBlogPost, updateBlogPost, deleteBlogPost } from "./actions";
import Link from "next/link";

export default function BlogClient({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    status: "draft"
  });

  const handleOpenModal = (post: any = null) => {
    if (post) {
      setEditingId(post.id);
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content,
        status: post.status
      });
    } else {
      setEditingId(null);
      setFormData({ title: "", slug: "", excerpt: "", content: "", status: "draft" });
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
          <div key={post.id} className="border border-white/5 bg-white/[0.02] rounded-2xl p-6 hover:border-white/10 transition-colors shadow-xl group">
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
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
            <p className="text-sm text-slate-400 mb-4 line-clamp-3">{post.excerpt || post.content}</p>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Globe className="w-3.5 h-3.5" />
              /{post.slug}
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="col-span-full py-16 text-center border border-white/5 border-dashed rounded-2xl">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No articles yet</h3>
            <p className="text-slate-400">Click "New Article" to start writing your first blog post.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-4">{editingId ? "Edit Article" : "Write New Article"}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Title</label>
                  <input required value={formData.title} onChange={handleTitleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition-colors" placeholder="e.g. How to Automate Instagram DMs" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Slug</label>
                  <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 font-mono focus:outline-none focus:border-fuchsia-500 transition-colors" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Excerpt (Optional)</label>
                <textarea rows={2} value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition-colors" placeholder="Short description for SEO and blog grid..." />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Content (Markdown Supported)</label>
                <textarea required rows={12} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono leading-relaxed focus:outline-none focus:border-fuchsia-500 transition-colors" placeholder="# Main Heading&#10;&#10;Write your article content here..." />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full md:w-1/3 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition-colors">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-fuchsia-500/20 transition-all active:scale-95">
                  {loading ? "Saving..." : "Save Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
