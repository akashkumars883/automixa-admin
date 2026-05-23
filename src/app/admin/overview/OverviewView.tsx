"use client";

import { useMemo } from "react";

type RecentWorkspace = {
  id: string;
  name: string;
  user_id: string | null;
  created_at: string | null;
};

type RecentAutomation = {
  id: string;
  page_name: string | null;
  page_id: string | null;
  user_id: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

type OverviewData = {
  counts: {
    workspaces: number;
    automations: number;
    triggers: number;
    history: number;
    subscriptions: number;
  };
  recent: {
    workspaces: RecentWorkspace[];
    automations: RecentAutomation[];
  };
  subscriptions: {
    summary: Record<string, number>;
  };
};

export default function OverviewView({ data }: { data: OverviewData }) {
  const subscriptionRows = useMemo(() => {
    const summary = data?.subscriptions?.summary || {};
    return Object.entries(summary)
      .map(([k, v]) => ({ key: k, count: v }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Overview</h1>
        <p className="mt-1 text-slate-400">Live metrics from Supabase.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {Object.entries(data.counts || {}).map(([k, v]) => (
          <div
            key={k}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl"
          >
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">{k}</div>
            <div className="mt-2 text-3xl font-bold text-white">{v}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
          <div className="text-sm font-medium text-slate-300">
            Recent Workspaces
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-white/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] backdrop-blur-md">
                <tr className="text-slate-400">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.workspaces.map((w) => (
                  <tr key={w.id} className="border-t border-slate-800">
                    <td className="px-3 py-2">{w.name}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-300">
                      {w.user_id}
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {w.created_at ? new Date(w.created_at).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
                {!data.recent.workspaces.length ? (
                  <tr className="border-t border-slate-800">
                    <td className="px-3 py-2 text-slate-400" colSpan={3}>
                      No workspaces found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
          <div className="text-sm font-medium text-slate-300">
            Recent Automations
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-white/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] backdrop-blur-md">
                <tr className="text-slate-400">
                  <th className="px-3 py-2">Page</th>
                  <th className="px-3 py-2">Active</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.automations.map((a) => (
                  <tr key={a.id} className="border-t border-slate-800">
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-100">
                        {a.page_name || "—"}
                      </div>
                      <div className="font-mono text-xs text-slate-400">
                        {a.page_id}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {a.is_active ? "Yes" : "No"}
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {a.created_at ? new Date(a.created_at).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
                {!data.recent.automations.length ? (
                  <tr className="border-t border-slate-800">
                    <td className="px-3 py-2 text-slate-400" colSpan={3}>
                      No automations found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 lg:col-span-2">
          <div className="text-sm font-medium text-slate-200">
            Subscriptions Summary
          </div>
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900">
                <tr className="text-slate-300">
                  <th className="px-3 py-2">Plan:Status</th>
                  <th className="px-3 py-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {subscriptionRows.map((r) => (
                  <tr key={r.key} className="border-t border-slate-800">
                    <td className="px-3 py-2 font-mono text-xs text-slate-300">
                      {r.key}
                    </td>
                    <td className="px-3 py-2">{r.count}</td>
                  </tr>
                ))}
                {!subscriptionRows.length ? (
                  <tr className="border-t border-slate-800">
                    <td className="px-3 py-2 text-slate-400" colSpan={2}>
                      No subscriptions found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

