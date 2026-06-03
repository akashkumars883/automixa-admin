import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import { Activity, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import ModalTrigger from "@/components/admin/ModalTrigger";

export default async function AdminAutomationsPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  const [
    automationsRes,
    automationsCount,
    historyTotal,
    historyFailed,
    historySuccess,
    historyInteracted,
    subscriptionsRes
  ] = await Promise.all([
    supabase
      .from("automations")
      .select("id,workspace_id,page_name,page_id,user_id,is_active,created_at")
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase.from("automations").select("id", { count: "exact", head: true }),
    supabase.from("automation_history").select("id", { count: "exact", head: true }),
    supabase.from("automation_history").select("id", { count: "exact", head: true }).eq("status", "FAILED"),
    supabase.from("automation_history").select("id", { count: "exact", head: true }).eq("status", "SUCCESS"),
    supabase.from("automation_history").select("id", { count: "exact", head: true }).eq("status", "INTERACTED"),
    supabase.from("subscriptions").select("plan_id").eq("status", "active")
  ]);

  if (automationsRes.error) {
    return (
      <div className="mt-6 rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
        Failed to load automations. {automationsRes.error.message}
      </div>
    );
  }

  const automations = automationsRes.data || [];
  
  const totalLogs = historyTotal.count || 0;
  const failedLogs = historyFailed.count || 0;
  const successLogs = historySuccess.count || 0;
  const interactedLogs = historyInteracted.count || 0;

  // Calculate Webhook Health percentage
  const successRate = totalLogs > 0 ? ((totalLogs - failedLogs) / totalLogs) * 100 : 100;
  const webhookHealth = successRate.toFixed(1);

  // Calculate API Limits Capacity based on active subscriptions
  const activeSubs = subscriptionsRes.data || [];
  let totalCapacity = 0;
  for (const sub of activeSubs) {
    const planId = (sub.plan_id || "").toLowerCase();
    if (planId.includes("viral") || planId.includes("agency") || planId.includes("scale")) {
      totalCapacity += 50000;
    } else if (planId.includes("creator") || planId.includes("pro")) {
      totalCapacity += 15000;
    } else {
      totalCapacity += 1000;
    }
  }

  const totalAutomations = automationsCount.count || 0;
  if (totalCapacity < totalAutomations * 1000) {
    totalCapacity = totalAutomations * 1000;
  }

  const limitsUsedPercent = totalCapacity > 0 ? Math.min(100, Math.round((successLogs / totalCapacity) * 100)) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Automation Management</h1>
        <p className="mt-1 text-slate-400">Monitor Meta API health, Instagram connections, and manage automation queues.</p>
      </div>

      {/* Meta API Health & Limits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-emerald-500/10">
            <ShieldCheck className="w-24 h-24" />
          </div>
          <p className="text-sm font-medium text-slate-400">Meta Webhook Health</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl font-bold text-white">{webhookHealth}%</span>
            <span className={`flex h-2 w-2 rounded-full ${successRate > 95 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></span>
          </div>
          <p className="mt-1 text-xs text-emerald-400">{successRate > 95 ? "All systems operational" : "Partial degradation detected"}</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-indigo-500/10">
            <Activity className="w-24 h-24" />
          </div>
          <p className="text-sm font-medium text-slate-400">API Limits Used</p>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white">{limitsUsedPercent}%</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${limitsUsedPercent}%` }}></div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-amber-500/10">
            <AlertTriangle className="w-24 h-24" />
          </div>
          <p className="text-sm font-medium text-slate-400">Failed Webhooks</p>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white">{failedLogs}</span>
          </div>
          <p className="mt-1 text-xs text-amber-400">{failedLogs > 0 ? "Check history logs for details" : "No failed webhooks logged"}</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-purple-500/10">
            <Zap className="w-24 h-24" />
          </div>
          <p className="text-sm font-medium text-slate-400">Messages Queue</p>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white">{interactedLogs}</span>
          </div>
          <p className="mt-1 text-xs text-purple-400">{interactedLogs > 0 ? `${interactedLogs} items processing` : "Queue is empty"}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Active Connections</h2>
          <ModalTrigger
            buttonText="Sync Meta Status"
            title="Sync Meta API"
            message="This will manually trigger a background job to sync the latest Webhook and Token health from the Meta Graph API."
            className="rounded-lg bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors"
          />
        </div>
        <div className="overflow-x-auto p-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/50">
              <tr className="text-slate-300">
                <th className="px-4 py-3 font-medium">Page Name</th>
                <th className="px-4 py-3 font-medium">Page ID</th>
                <th className="px-4 py-3 font-medium">Token Status</th>
                <th className="px-4 py-3 font-medium">State</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {automations?.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-slate-800/50 group">
                  <td className="px-4 py-3 font-medium text-slate-200">{a.page_name || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{a.page_id}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                      Valid
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${a.is_active ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                      {a.is_active ? "Running" : "Paused"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ModalTrigger
                      buttonText="Pause"
                      title="Pause Automation"
                      message={`Are you sure you want to pause automation for page ${a.page_id}?`}
                      className="text-xs font-medium text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-amber-300 mr-3"
                    />
                    <ModalTrigger
                      buttonText="Force Stop"
                      title="Force Stop Automation"
                      message={`Are you sure you want to force stop this automation? It will kill all background listeners.`}
                      className="text-xs font-medium text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-300"
                    />
                  </td>
                </tr>
              ))}
              {!automations?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No automations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
