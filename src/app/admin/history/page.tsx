import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";

const STATUS_STYLES: Record<string, string> = {
  SUCCESS:          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  FAILED:           "bg-red-50 text-red-700 ring-1 ring-red-200",
  LIMIT_EXCEEDED:   "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  HANDOVER:         "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  COOLDOWN_ACTIVE:  "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  DUPLICATE_SKIPPED:"bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

const TYPE_STYLES: Record<string, string> = {
  COMMENT:          "bg-indigo-50 text-indigo-700",
  DM:               "bg-cyan-50 text-cyan-700",
  STORY:            "bg-pink-50 text-pink-700",
  HELP_REQUESTED:   "bg-yellow-50 text-yellow-700",
  AUTOMIXA_SHIELD:  "bg-violet-50 text-violet-700",
};

export default async function AdminHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const pageParam = typeof resolvedParams.page === "string" ? resolvedParams.page : "1";
  const typeFilter = typeof resolvedParams.type === "string" ? resolvedParams.type : "";
  const statusFilter = typeof resolvedParams.status === "string" ? resolvedParams.status : "";

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

  let query = supabase
    .from("automation_history")
    .select("id,automation_id,sender_name,type,keyword,status,created_at,metadata", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (typeFilter) query = query.eq("type", typeFilter);
  if (statusFilter) query = query.eq("status", statusFilter);

  const { data: history, error, count } = await query;

  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  if (error) {
    return (
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Failed to load history. {error.message}
      </div>
    );
  }

  const buildUrl = (newPage: number, newType?: string, newStatus?: string) => {
    const params = new URLSearchParams();
    params.set("page", String(newPage));
    if ((newType ?? typeFilter)) params.set("type", newType ?? typeFilter);
    if ((newStatus ?? statusFilter)) params.set("status", newStatus ?? statusFilter);
    return `/admin/history?${params.toString()}`;
  };

  const TYPES = ["COMMENT", "DM", "STORY", "HELP_REQUESTED", "AUTOMIXA_SHIELD"];
  const STATUSES = ["SUCCESS", "FAILED", "LIMIT_EXCEEDED", "HANDOVER", "COOLDOWN_ACTIVE", "DUPLICATE_SKIPPED"];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Automation History</h1>
        <p className="mt-1 text-sm text-slate-500">
          Live log of all automation events. Total: <span className="font-semibold text-slate-700">{count?.toLocaleString() || 0}</span> events
          {typeFilter && <> · Filtered by type: <span className="font-semibold text-indigo-600">{typeFilter}</span></>}
          {statusFilter && <> · Status: <span className="font-semibold text-indigo-600">{statusFilter}</span></>}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href={buildUrl(1, "", "")} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${!typeFilter && !statusFilter ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
          All
        </Link>
        {TYPES.map(t => (
          <Link key={t} href={buildUrl(1, t, statusFilter)} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${typeFilter === t ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
            {t}
          </Link>
        ))}
        <span className="w-px h-6 bg-slate-200 self-center mx-1" />
        {STATUSES.map(s => (
          <Link key={s} href={buildUrl(1, typeFilter, s)} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${statusFilter === s ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
            {s}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Sender</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Keyword</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Details</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history?.map((h) => (
                <tr key={h.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[h.type] || "bg-slate-100 text-slate-600"}`}>
                      {h.type || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-700 font-medium text-xs">{h.sender_name || <span className="text-slate-400">—</span>}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-slate-500">{h.keyword || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[h.status?.toUpperCase()] || "bg-slate-100 text-slate-600"}`}>
                      {h.status || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-[220px] truncate text-xs" title={
                    h.status?.toUpperCase() === "SUCCESS"
                      ? h.metadata?.replied_with || "Reply sent"
                      : h.metadata?.error || h.metadata?.reason || "—"
                  }>
                    {h.status?.toUpperCase() === "SUCCESS"
                      ? (h.metadata?.replied_with ? `✓ ${h.metadata.replied_with}` : "Reply sent ✓")
                      : (h.metadata?.error || h.metadata?.reason || "—")}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {h.created_at ? new Date(h.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                </tr>
              ))}
              {!history?.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      No history logs found{typeFilter || statusFilter ? " for this filter" : ""}.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs text-slate-500">
            Showing <span className="font-medium text-slate-700">{history?.length ? from + 1 : 0}</span>–<span className="font-medium text-slate-700">{Math.min(to + 1, count || 0)}</span> of <span className="font-medium text-slate-700">{count?.toLocaleString() || 0}</span>
          </div>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={buildUrl(page - 1)} className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-xs font-medium rounded-lg transition-colors shadow-sm">
                ← Previous
              </Link>
            ) : (
              <button disabled className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-300 text-xs font-medium rounded-lg cursor-not-allowed">
                ← Previous
              </button>
            )}
            <span className="px-3 py-1.5 text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
            {page < totalPages ? (
              <Link href={buildUrl(page + 1)} className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-xs font-medium rounded-lg transition-colors shadow-sm">
                Next →
              </Link>
            ) : (
              <button disabled className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-300 text-xs font-medium rounded-lg cursor-not-allowed">
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
