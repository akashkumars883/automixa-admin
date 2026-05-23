import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import OverviewView from "./OverviewView";

export default async function AdminOverviewPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  const [
    workspacesCount,
    automationsCount,
    triggersCount,
    historyCount,
    subscriptionsCount,
    recentWorkspaces,
    recentAutomations,
    subscriptions,
  ] = await Promise.all([
    supabase.from("workspaces").select("id", { count: "exact", head: true }),
    supabase.from("automations").select("id", { count: "exact", head: true }),
    supabase.from("triggers").select("id", { count: "exact", head: true }),
    supabase
      .from("automation_history")
      .select("id", { count: "exact", head: true }),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }),
    supabase
      .from("workspaces")
      .select("id,name,user_id,created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("automations")
      .select("id,page_name,page_id,user_id,is_active,created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("subscriptions").select("plan_id,status"),
  ]);

  const errors = [
    workspacesCount.error,
    automationsCount.error,
    triggersCount.error,
    historyCount.error,
    subscriptionsCount.error,
    recentWorkspaces.error,
    recentAutomations.error,
    subscriptions.error,
  ].filter(Boolean);

  if (errors.length) {
    return (
      <div className="mt-6 rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
        Failed to load admin overview.
      </div>
    );
  }

  const subscriptionSummary: Record<string, number> = {};
  for (const row of subscriptions.data || []) {
    const key = `${row.plan_id || "unknown"}:${row.status || "unknown"}`;
    subscriptionSummary[key] = (subscriptionSummary[key] || 0) + 1;
  }

  const data = {
    counts: {
      workspaces: workspacesCount.count ?? 0,
      automations: automationsCount.count ?? 0,
      triggers: triggersCount.count ?? 0,
      history: historyCount.count ?? 0,
      subscriptions: subscriptionsCount.count ?? 0,
    },
    recent: {
      workspaces: recentWorkspaces.data || [],
      automations: recentAutomations.data || [],
    },
    subscriptions: {
      summary: subscriptionSummary,
    },
  };

  return <OverviewView data={data} />;
}
