"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Megaphone, Trash2, Send } from "lucide-react";

export default function BroadcastsClient({ initialBroadcasts }) {
  const [broadcasts, setBroadcasts] = useState(initialBroadcasts || []);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [link, setLink] = useState("");
  const [days, setDays] = useState(7);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(days));

      const newBroadcast = {
        title,
        message,
        type,
        link: link || null,
        is_active: true,
        expires_at: expiresAt.toISOString()
      };

      const supabase = createClient();
      const { data, error } = await supabase
        .from("system_broadcasts")
        .insert([newBroadcast])
        .select()
        .single();

      if (error) throw error;
      
      setBroadcasts([data, ...broadcasts]);
      setTitle("");
      setMessage("");
      setLink("");
    } catch (err) {
      alert("Failed to create broadcast: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this broadcast?")) return;
    
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("system_broadcasts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setBroadcasts(broadcasts.filter(b => b.id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl h-fit">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Megaphone size={18} className="text-indigo-400" />
          New Broadcast
        </h2>
        
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
            <input 
              type="text" required value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
              placeholder="e.g. Scheduled Maintenance"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Message</label>
            <textarea 
              required value={message} onChange={e => setMessage(e.target.value)} rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none resize-none"
              placeholder="e.g. Automixa will be down for 30 mins..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Type (Color)</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none">
              <option value="info">Info (Blue)</option>
              <option value="warning">Warning (Yellow)</option>
              <option value="error">Error (Red)</option>
              <option value="success">Success (Green)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Action Link (Optional)</label>
            <input 
              type="text" value={link} onChange={e => setLink(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Active Duration (Days)</label>
            <input 
              type="number" min="1" max="30" value={days} onChange={e => setDays(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
            />
          </div>
          
          <button 
            type="submit" disabled={loading}
            className="w-full mt-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
          >
            <Send size={16} /> Send Broadcast
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {broadcasts.map(b => (
          <div key={b.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-xl shadow-lg relative flex items-start gap-4">
            <div className={`p-2 rounded-full mt-1 ${
              b.type === 'error' ? 'bg-red-500/10 text-red-400' :
              b.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
              b.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
              'bg-blue-500/10 text-blue-400'
            }`}>
              <Megaphone size={16} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{b.title}</h3>
                <span className="text-xs text-slate-500">{new Date(b.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">{b.message}</p>
              {b.link && (
                <a href={b.link} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline mt-2 inline-block">View Link &rarr;</a>
              )}
            </div>
            <button onClick={() => handleDelete(b.id)} disabled={loading} className="text-slate-500 hover:text-red-400 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {broadcasts.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No active broadcasts.
          </div>
        )}
      </div>
    </div>
  );
}
