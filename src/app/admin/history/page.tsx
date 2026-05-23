import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";

export default async function AdminHistoryPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  const { data: history, error } = await supabase
    .from("automation_history")
    .select("id,automation_id,status,created_at,error_message")
    .order("created_at", { ascending: false })
    .limit(100); // Limit to 100 recent entries for performance

  if (error) {
    return (
      <div className="mt-6 rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
        Failed to load history. {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Automation History</h1>
        <p className="text-slate-400">Recent logs of automation executions (Last 100).</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
        <div className="overflow-x-auto p-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/50">
              <tr className="text-slate-300">
                <th className="px-4 py-3 font-medium">Automation ID</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Message/Error</th>
                <th className="px-4 py-3 font-medium">Executed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {history?.map((h) => (
                <tr key={h.id} className="transition-colors hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{h.automation_id}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${h.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {h.status || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 max-w-xs truncate" title={h.error_message || ""}>
                    {h.error_message || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {h.created_at ? new Date(h.created_at).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
              {!history?.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No history logs found.
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
