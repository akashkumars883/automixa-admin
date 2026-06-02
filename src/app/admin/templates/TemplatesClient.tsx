"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { createTemplate, updateTemplate, deleteTemplate } from "./actions";

interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  is_premium: boolean;
  is_active: boolean;
}

export default function TemplatesClient({ initialTemplates }: { initialTemplates: Template[] }) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "dm",
    description: "",
    content: "",
    is_premium: false,
    is_active: true,
  });

  const handleOpenModal = (template: Template | null = null) => {
    if (template) {
      setEditingId(template.id);
      setFormData({
        title: template.title,
        category: template.category,
        description: template.description,
        content: template.content,
        is_premium: template.is_premium,
        is_active: template.is_active,
      });
    } else {
      setEditingId(null);
      setFormData({ title: "", category: "dm", description: "", content: "", is_premium: false, is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let res;
    if (editingId) {
      res = await updateTemplate(editingId, formData);
    } else {
      res = await createTemplate(formData);
    }

    if (res.success) {
      setIsModalOpen(false);
      window.location.reload(); // Hard reload to fetch new data easily for now
    } else {
      alert("Error: " + res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    const res = await deleteTemplate(id);
    if (res.success) {
      setTemplates(templates.filter(t => t.id !== id));
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => (
          <div key={t.id} className="border border-white/10 bg-white/5 rounded-xl p-5 hover:border-white/20 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] uppercase tracking-wider rounded font-semibold">
                {t.category}
              </span>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(t)} className="text-slate-400 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(t.id)} className="text-slate-400 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1 truncate">{t.title}</h3>
            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{t.description}</p>
            <div className="flex gap-2 text-xs font-medium">
              <span className={`px-2 py-1 rounded ${t.is_premium ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'}`}>
                {t.is_premium ? 'Premium' : 'Free'}
              </span>
              <span className={`px-2 py-1 rounded ${t.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {t.is_active ? 'Active' : 'Draft'}
              </span>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No templates found. Click &quot;Create Template&quot; to add one.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">{editingId ? "Edit Template" : "New Template"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                  <option value="dm">DM Reply</option>
                  <option value="comment">Comment Reply</option>
                  <option value="story">Story Mention</option>
                  <option value="campaign">Outbound Campaign</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Content / Message</label>
                <textarea required rows={4} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={formData.is_premium} onChange={e => setFormData({...formData, is_premium: e.target.checked})} className="rounded bg-white/5 border-white/10" />
                  Premium Only
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="rounded bg-white/5 border-white/10" />
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg">
                  {loading ? "Saving..." : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
