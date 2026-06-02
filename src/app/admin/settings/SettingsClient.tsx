"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Settings2, Save } from "lucide-react";

export default function SettingsClient({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings || []);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleToggle = async (key, currentValue) => {
    setLoading(true);
    setMessage(null);
    try {
      const newValue = currentValue === "true" ? "false" : "true";
      
      const supabase = createClient();
      const { error } = await supabase
        .from("global_settings")
        .update({ value: newValue, updated_at: new Date().toISOString() })
        .eq("key", key);

      if (error) throw error;
      
      setSettings(settings.map(s => s.key === key ? { ...s, value: newValue } : s));
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update setting: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          <Settings2 className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Feature Toggles</h2>
          <p className="text-xs text-slate-400">Instantly enable or disable core features across the app.</p>
        </div>
      </div>

      {message && (
        <div className="p-3 mb-4 rounded-xl flex items-center gap-2 text-sm bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {settings.map(setting => (
          <div key={setting.key} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-slate-200 uppercase tracking-wide">{setting.key.replace(/_/g, ' ')}</p>
              <p className="text-xs text-slate-400 mt-1">{setting.description}</p>
            </div>
            <button
              onClick={() => handleToggle(setting.key, setting.value)}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting.value === "true" ? 'bg-indigo-500' : 'bg-slate-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.value === "true" ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
        {settings.length === 0 && (
          <p className="text-slate-400 text-sm py-4 text-center">No global settings found in database.</p>
        )}
      </div>
    </div>
  );
}
