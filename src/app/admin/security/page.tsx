import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import { Shield, Key, AlertCircle, Users } from "lucide-react";
import ModalTrigger from "@/components/admin/ModalTrigger";

const API_KEY_TABLES = ["api_keys", "api_secrets", "developer_keys"];
const SECURITY_LOG_TABLES = ["security_logs", "audit_logs", "login_alerts", "auth_events"];

async function findDataTable(supabase: any, tables: string[]) {
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error) {
      return { table, data: data || [] };
    }

    if (error.code !== "42P01") {
      console.error(`Security table fetch error for ${table}:`, error);
    }
  }

  return { table: null, data: [] };
}

function formatApiKeyLabel(key: any) {
  if (key.name) return key.name;
  if (key.label) return key.label;
  return key.id || "Unknown";
}

export default async function AdminSecurityPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();
  const [apiKeyResult, logResult] = await Promise.all([
    findDataTable(supabase, API_KEY_TABLES),
    findDataTable(supabase, SECURITY_LOG_TABLES),
  ]);

  const apiKeys = apiKeyResult.data || [];
  const logs = logResult.data || [];
  const activeKeys = apiKeys.filter((key: any) => !["revoked", "inactive", "disabled"].includes((key.status || "").toLowerCase())).length;
  const recentLogs = logs.slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-rose-500" /> Security & Access
        </h1>
        <p className="mt-1 text-slate-400">Manage admin roles, API keys, security logs, and audit events.</p>
        <p className="mt-2 text-xs text-slate-500">
          {apiKeyResult.table && logResult.table
            ? `Live data from ${apiKeyResult.table} and ${logResult.table}.`
            : apiKeyResult.table
              ? `Live key data from ${apiKeyResult.table}. Audit logs are not available.`
              : logResult.table
                ? `Live security logs from ${logResult.table}. API key table is not available.`
                : "No dedicated security tables found; data is shown as available."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-slate-800 text-slate-400 rounded-full">Keys</span>
          </div>
          <p className="text-sm font-medium text-slate-400">Active API Keys</p>
          <p className="mt-1 text-3xl font-bold text-white">{activeKeys}</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Key className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-slate-800 text-slate-400 rounded-full">Total</span>
          </div>
          <p className="text-sm font-medium text-slate-400">Total API Keys</p>
          <p className="mt-1 text-3xl font-bold text-white">{apiKeys.length}</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-rose-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-slate-800 text-slate-400 rounded-full">Logs</span>
          </div>
          <p className="text-sm font-medium text-slate-400">Recent Events</p>
          <p className="mt-1 text-3xl font-bold text-white">{recentLogs.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Active API Keys</h2>
          {apiKeys.length > 0 ? (
            <div className="space-y-4">
              {apiKeys.map((key: any) => (
                <div key={key.id || key.name} className="border border-slate-800 bg-slate-900/50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-200">{formatApiKeyLabel(key)}</p>
                    <p className="text-xs text-slate-400 mt-1">{key.status || "unknown"} • {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : "Never used"}</p>
                  </div>
                  <ModalTrigger
                    buttonText="Revoke"
                    title="Revoke API Key"
                    message={`Are you sure you want to revoke ${formatApiKeyLabel(key)}?`}
                    className="text-xs text-red-400 hover:text-red-300"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-400">
              No API key records found in the configured security schema.
            </div>
          )}
          <ModalTrigger
            buttonText="Generate New Key"
            title="Generate API Key"
            message="You are about to generate a new API key. Please specify the environment (Production/Development)."
            className="mt-4 w-full py-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-medium hover:bg-indigo-500/20 transition-colors"
          />
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Recent Security Events</h2>
          {recentLogs.length > 0 ? (
            <div className="space-y-4">
              {recentLogs.map((event: any, idx: number) => (
                <div key={event.id || idx} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                  <p className="text-sm font-medium text-slate-200">{event.event_type || event.description || "Security event"}</p>
                  <p className="text-xs text-slate-400 mt-1">{event.ip_address ? `IP: ${event.ip_address}` : event.severity || "No extra metadata"}</p>
                  <p className="text-xs text-slate-500 mt-2">{event.created_at ? new Date(event.created_at).toLocaleString() : "Unknown time"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-400">
              No security logs detected in the current schema.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
