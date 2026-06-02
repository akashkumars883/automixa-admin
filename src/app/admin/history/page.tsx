import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";

export default async function AdminHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const pageParam = typeof resolvedParams.page === "string" ? resolvedParams.page : "1";
  const page = parseInt(pageParam, 10) || 1;
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  const { data: history, error, count } = await supabase
    .from("automation_history")
    .select("id,automation_id,status,created_at,metadata", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
    
  const totalPages = count ? Math.ceil(count / pageSize) : 1;

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
        <p className="text-slate-400">Logs of automation executions (Page {page} of {totalPages}). Total: {count || 0}</p>
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
                  <td className="px-4 py-3 text-slate-300 max-w-xs truncate" title={h.metadata?.error || h.metadata?.error_details || "No error"}>
                    {h.status === 'success' ? "—" : (h.metadata?.error || h.metadata?.error_details || "—")}
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

      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Showing <span className="font-medium text-slate-200">{history?.length ? from + 1 : 0}</span> to <span className="font-medium text-slate-200">{Math.min(to + 1, count || 0)}</span> of <span className="font-medium text-slate-200">{count || 0}</span> results
        </div>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link 
              href={`/admin/history?page=${page - 1}`}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors"
            >
              Previous
            </Link>
          ) : (
            <button disabled className="px-4 py-2 bg-slate-800/50 text-slate-500 text-sm font-medium rounded-lg cursor-not-allowed">
              Previous
            </button>
          )}
          
          {page < totalPages ? (
            <Link 
              href={`/admin/history?page=${page + 1}`}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors"
            >
              Next
            </Link>
          ) : (
            <button disabled className="px-4 py-2 bg-slate-800/50 text-slate-500 text-sm font-medium rounded-lg cursor-not-allowed">
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
