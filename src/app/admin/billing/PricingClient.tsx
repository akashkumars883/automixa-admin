"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Check, Edit2, Save, X } from "lucide-react";

export default function PricingClient({ initialPlans }: { initialPlans?: any[] }) {
  const [plans, setPlans] = useState(initialPlans || []);
  const [editingId, setEditingId] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleEdit = (plan: any) => {
    setEditingId(plan.id);
    setEditForm({ ...plan, features: JSON.stringify(plan.features, null, 2) });
  };

  const handleSave = async (id: any) => {
    setLoading(true);
    try {
      const parsedFeatures = JSON.parse(editForm.features);
      const updates = {
        name: editForm.name,
        price_inr_monthly: editForm.price_inr_monthly,
        price_usd_monthly: editForm.price_usd_monthly,
        price_inr_annual: editForm.price_inr_annual,
        price_usd_annual: editForm.price_usd_annual,
        features: parsedFeatures,
        is_active: editForm.is_active,
      };
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update plan');
      setPlans(plans.map(p => p.id === id ? { ...editForm, features: parsedFeatures } : p));
      setEditingId(null);
    } catch (err: any) {
      alert('Failed to update plan: ' + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl col-span-1 lg:col-span-2 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Dynamic Pricing Plans</h2>
        <span className="text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">Reflects instantly on main app</span>
      </div>

      <div className="overflow-x-auto p-1">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/50">
            <tr className="text-slate-300">
              <th className="px-4 py-3 font-medium">Plan ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Monthly (INR / USD)</th>
              <th className="px-4 py-3 font-medium">Annual (INR / USD)</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {plans?.map((plan) => (
              <tr key={plan.id} className="transition-colors hover:bg-slate-800/50">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{plan.plan_id}</td>

                {editingId === plan.id ? (
                  <>
                    <td className="px-4 py-3">
                      <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                    </td>
                    <td className="px-4 py-3 space-y-1">
                      <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 text-xs" placeholder="INR" value={editForm.price_inr_monthly} onChange={e => setEditForm({ ...editForm, price_inr_monthly: parseInt(e.target.value) })} />
                      <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 text-xs" placeholder="USD" value={editForm.price_usd_monthly} onChange={e => setEditForm({ ...editForm, price_usd_monthly: parseInt(e.target.value) })} />
                    </td>
                    <td className="px-4 py-3 space-y-1">
                      <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 text-xs" placeholder="INR" value={editForm.price_inr_annual} onChange={e => setEditForm({ ...editForm, price_inr_annual: parseInt(e.target.value) })} />
                      <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 text-xs" placeholder="USD" value={editForm.price_usd_annual} onChange={e => setEditForm({ ...editForm, price_usd_annual: parseInt(e.target.value) })} />
                    </td>
                    <td className="px-4 py-3">
                      <select className="bg-slate-900 border border-slate-700 rounded p-1 text-slate-200" value={editForm.is_active} onChange={e => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => handleSave(plan.id)} disabled={loading} className="text-emerald-400 hover:text-emerald-300"><Save size={16} /></button>
                      <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-300"><X size={16} /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-slate-200 font-medium">{plan.name}</td>
                    <td className="px-4 py-3 text-slate-300">₹{plan.price_inr_monthly} / ${plan.price_usd_monthly}</td>
                    <td className="px-4 py-3 text-slate-300">₹{plan.price_inr_annual} / ${plan.price_usd_annual}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${plan.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleEdit(plan)} className="text-blue-400 hover:text-blue-300"><Edit2 size={16} /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
