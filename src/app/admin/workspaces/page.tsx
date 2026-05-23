import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";

export default async function AdminWorkspacesPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("id,name,user_id,created_at, automations(id)")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mt-6 rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
        Failed to load workspaces. {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
        <p className="text-slate-400">Manage all registered workspaces.</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
        <div className="overflow-x-auto p-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/50">
              <tr className="text-slate-300">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">User ID</th>
                <th className="px-4 py-3 font-medium">Automations</th>
                <th className="px-4 py-3 font-medium">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {workspaces?.map((w) => (
                <tr key={w.id} className="transition-colors hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-200">{w.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{w.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{w.user_id}</td>
                  <td className="px-4 py-3 text-slate-300">{w.automations?.length || 0}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {w.created_at ? new Date(w.created_at).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
              {!workspaces?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No workspaces found.
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
