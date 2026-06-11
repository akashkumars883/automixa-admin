"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function ManualPaymentsManager({ initialPayments = [] }: { initialPayments: any[] }) {
  const [payments, setPayments] = useState(initialPayments);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (paymentId: string, action: 'approve' | 'reject', userId: string, planId: string) => {
    if (!confirm(`Are you sure you want to ${action} this payment?`)) return;

    setLoadingId(paymentId);
    try {
      const supabase = createClient();
      
      // Update manual payment status
      const { error: updateError } = await supabase
        .from("manual_payments")
        .update({ status: action === 'approve' ? 'approved' : 'rejected', updated_at: new Date().toISOString() })
        .eq("id", paymentId);

      if (updateError) throw updateError;

      // If approved, update user's subscription
      if (action === 'approve') {
        const { error: subError } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            plan_id: planId,
            status: "active",
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (subError) throw subError;
      }

      // Remove from UI
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      alert(`Payment ${action}d successfully.`);

    } catch (err: any) {
      console.error(err);
      alert("Error: " + (err.message || String(err)));
    } finally {
      setLoadingId(null);
    }
  };

  if (payments.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 lg:p-6 backdrop-blur-xl shadow-2xl col-span-1 lg:col-span-2 mt-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/20 rounded-lg">
          <Clock className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Pending UPI Verifications</h2>
          <p className="text-xs text-amber-200/60">Review UTR numbers and approve manual payments to upgrade users.</p>
        </div>
      </div>

      <div className="overflow-x-auto p-1">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-amber-500/20 bg-amber-900/20">
            <tr className="text-amber-200">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">User ID</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">UPI Ref No (UTR)</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-500/10">
            {payments.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-amber-900/10">
                <td className="px-4 py-3 font-mono text-xs text-slate-300">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.user_id?.substring(0, 8)}...</td>
                <td className="px-4 py-3 text-white font-semibold uppercase text-xs">{p.plan_id}</td>
                <td className="px-4 py-3 text-slate-200">₹{p.amount}</td>
                <td className="px-4 py-3">
                  <span className="font-mono bg-amber-900/40 text-amber-300 px-2 py-1 rounded text-xs tracking-wider select-all">
                    {p.utr_number}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => handleAction(p.id, 'reject', p.user_id, p.plan_id)}
                    disabled={loadingId === p.id}
                    className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-md transition-colors disabled:opacity-50"
                    title="Reject"
                  >
                    <XCircle size={16} />
                  </button>
                  <button
                    onClick={() => handleAction(p.id, 'approve', p.user_id, p.plan_id)}
                    disabled={loadingId === p.id}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors text-xs font-semibold disabled:opacity-50"
                  >
                    {loadingId === p.id ? "..." : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
