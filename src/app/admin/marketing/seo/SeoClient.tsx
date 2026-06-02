"use client";

import { useState } from "react";
import { Globe, ArrowLeft, Save } from "lucide-react";
import { updateSeoSettings } from "./actions";
import Link from "next/link";

interface SeoSetting {
  setting_key: string;
  setting_value: string;
}

export default function SeoClient({ initialSettings }: { initialSettings: SeoSetting[] }) {
  const [loading, setLoading] = useState(false);
  
  // Transform array into a key-value object for easy form binding
  const defaultState = initialSettings.reduce((acc, curr) => {
    acc[curr.setting_key] = curr.setting_value;
    return acc;
  }, {} as Record<string, string>);

  const [formData, setFormData] = useState(defaultState);

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = Object.keys(formData).map(key => ({
      key,
      value: formData[key]
    }));

    const res = await updateSeoSettings(payload);
    if (res.success) {
      alert("SEO Settings updated successfully!");
    } else {
      alert("Error: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/marketing" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Globe className="w-8 h-8 text-emerald-400" /> SEO Tools
          </h1>
          <p className="mt-1 text-slate-400">Configure global metadata and open-graph imagery.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border border-white/5 bg-white/[0.02] rounded-2xl p-6 lg:p-10 shadow-2xl">
        <div className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Global Site Title</label>
            <input 
              value={formData['site_title'] || ''} 
              onChange={e => handleChange('site_title', e.target.value)} 
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" 
              placeholder="Automixa - AI Instagram Automation" 
            />
            <p className="mt-1 text-xs text-slate-500">Appended to all page titles as a fallback.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Meta Description</label>
            <textarea 
              rows={3} 
              value={formData['meta_description'] || ''} 
              onChange={e => handleChange('meta_description', e.target.value)} 
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" 
              placeholder="Automate your DMs, Comments, and Stories with AI." 
            />
            <p className="mt-1 text-xs text-slate-500">Used by search engines to understand your site&apos;s purpose.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Default OpenGraph Image URL</label>
            <input 
              value={formData['og_image'] || ''} 
              onChange={e => handleChange('og_image', e.target.value)} 
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 font-mono focus:outline-none focus:border-emerald-500 transition-colors" 
              placeholder="https://automixa.in/og-image.jpg" 
            />
            <p className="mt-1 text-xs text-slate-500">The default image shown when links are shared on social media.</p>
            {formData['og_image'] && (
              <div className="mt-4 border border-white/10 rounded-xl overflow-hidden max-w-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData['og_image']} alt="OG Preview" className="w-full h-auto object-cover opacity-80" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Twitter Handle</label>
            <input 
              value={formData['twitter_handle'] || ''} 
              onChange={e => handleChange('twitter_handle', e.target.value)} 
              className="w-full md:w-1/2 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" 
              placeholder="@automixa" 
            />
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex justify-end">
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
            {loading ? "Saving..." : <><Save className="w-4 h-4" /> Save Configuration</>}
          </button>
        </div>
      </form>
    </div>
  );
}
