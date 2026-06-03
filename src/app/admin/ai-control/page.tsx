import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import { BrainCircuit, Cpu, DollarSign, TextSelect } from "lucide-react";
import ModalTrigger from "@/components/admin/ModalTrigger";

const AI_USAGE_CANDIDATES = [
  "ai_prompt_logs",
  "prompt_logs",
  "llm_usage",
  "ai_usage",
  "ai_requests",
  "openai_logs",
  "api_usage",
];

function safeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseMetadata(value: unknown) {
  if (!value) return {};
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return {};
}

async function fetchAiUsageLogs(supabase: any) {
  for (const table of AI_USAGE_CANDIDATES) {
    const { data, error } = await supabase
      .from(table)
      .select("workspace_id, model, tokens, latency_ms, cost, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error) {
      return { table, logs: data || [] };
    }

    if (error.code !== "42P01") {
      console.error(`AI table fetch error for ${table}:`, error);
    }
  }

  const { data: history, error } = await supabase
    .from("automation_history")
    .select("automation_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (!error && history) {
    const logs = history.map((row: any) => {
      const metadata = parseMetadata(row.metadata);
      return {
        workspace_id: row.automation_id || null,
        model: metadata.model || metadata.provider || "unknown",
        tokens: safeNumber(metadata.tokens ?? metadata.token_count ?? metadata.prompt_tokens ?? metadata.total_tokens),
        latency_ms: safeNumber(metadata.latency_ms ?? metadata.latency ?? metadata.duration_ms ?? 0),
        cost: safeNumber(metadata.cost ?? metadata.estimated_cost ?? 0),
        created_at: row.created_at,
      };
    });

    return { table: "automation_history", logs };
  }

  return { table: null, logs: [] };
}

export default async function AdminAiControlPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();
  const { table: sourceTable, logs } = await fetchAiUsageLogs(supabase);

  const totalTokens = logs.reduce((sum: number, row: any) => sum + safeNumber(row.tokens), 0);
  const totalCost = logs.reduce((sum: number, row: any) => sum + safeNumber(row.cost), 0);
  const promptsProcessed = logs.length;
  const uniqueWorkspaces = new Set(logs.map((row: any) => row.workspace_id).filter(Boolean)).size;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-indigo-400" /> AI Control Panel
        </h1>
        <p className="mt-1 text-slate-400">
          Monitor API usage, model costs, and prompt logs from live data.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {sourceTable
            ? `Showing recent AI usage from ${sourceTable}.`
            : "No dedicated AI usage table found. Showing fallback automation activity if available."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Cpu className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full">Tokens</span>
          </div>
          <p className="text-sm font-medium text-slate-400">Total Tokens Used</p>
          <p className="mt-1 text-3xl font-bold text-white">{totalTokens.toLocaleString()}</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-slate-800 text-slate-400 rounded-full">USD</span>
          </div>
          <p className="text-sm font-medium text-slate-400">Estimated Cost</p>
          <p className="mt-1 text-3xl font-bold text-white">${totalCost.toFixed(2)}</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <TextSelect className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-slate-800 text-slate-400 rounded-full">Prompts</span>
          </div>
          <p className="text-sm font-medium text-slate-400">Prompts Processed</p>
          <p className="mt-1 text-3xl font-bold text-white">{promptsProcessed}</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-slate-500/10 rounded-lg">
              <span className="text-xs font-semibold text-slate-200">W</span>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-slate-800 text-slate-400 rounded-full">Workspaces</span>
          </div>
          <p className="text-sm font-medium text-slate-400">Unique Workspaces</p>
          <p className="mt-1 text-3xl font-bold text-white">{uniqueWorkspaces}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent AI Prompt Logs</h2>
          <ModalTrigger
            buttonText="View All"
            title="All Prompt Logs"
            message="Viewing full history of AI prompt logs and analytics."
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
          />
        </div>
        <div className="overflow-x-auto p-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/50">
              <tr className="text-slate-300">
                <th className="px-4 py-3 font-medium">Workspace ID</th>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Tokens</th>
                <th className="px-4 py-3 font-medium">Latency</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {logs.length > 0 ? (
                logs.map((log: any, index: number) => (
                  <tr key={`${log.workspace_id ?? "log"}-${index}`} className="transition-colors hover:bg-slate-800/50 group">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.workspace_id || "unknown"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                        {log.model || "unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono">{safeNumber(log.tokens).toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-400 font-mono">
                      {log.latency_ms ? `${safeNumber(log.latency_ms)}ms` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No AI prompt logs found in the current database schema.
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
