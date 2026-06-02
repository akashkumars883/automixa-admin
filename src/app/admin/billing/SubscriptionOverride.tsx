"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { CreditCard, AlertCircle } from "lucide-react";

export default function SubscriptionOverride() {
  const [userId, setUserId] = useState("");
  const [planId, setPlanId] = useState("creator_pro");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleOverride = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;

    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      
      // Upsert subscription
      const { error } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: userId.trim(),
          plan_id: planId,
          status: status,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      setMessage({ type: "success", text: "Subscription successfully updated!" });
      setUserId("");
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl col-span-1 lg:col-span-2 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-rose-500/10 rounded-lg">
          <CreditCard className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Manual Subscription Override</h2>
          <p className="text-xs text-slate-400">Force upgrade/downgrade a user bypassing Stripe/Razorpay.</p>
        </div>
      </div>

      {message && (
        <div className={`p-3 mb-4 rounded-xl flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
          <AlertCircle size={16} />
          {message.text}
        </div>
      )}

      <form onSubmit={handleOverride} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-400 mb-1">User ID (UUID)</label>
          <input 
            type="text" 
            required
            value={userId}
            onChange={e => setUserId(e.target.value)}
            placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block text-xs font-medium text-slate-400 mb-1">Plan</label>
          <select 
            value={planId}
            onChange={e => setPlanId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
          >
            <option value="free">Free</option>
            <option value="creator_pro">Creator Pro</option>
            <option value="viral_scale">Viral Scale</option>
          </select>
        </div>
        <div className="w-full md:w-48">
          <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
          <select 
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
          >
            <option value="active">Active</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full md:w-auto px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors h-[42px]"
        >
          {loading ? "Saving..." : "Override"}
        </button>
      </form>
    </div>
  );
}
