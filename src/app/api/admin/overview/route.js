import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdminFromRequest } from "@/lib/adminAuth";

export async function GET(request) {
  const unauthorized = requireAdminFromRequest(request);
  if (unauthorized) return unauthorized;

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
    return NextResponse.json(
      { error: "Failed to load admin overview", details: errors.map((e) => e.message) },
      { status: 500 }
    );
  }

  const subscriptionSummary = {};
  for (const row of subscriptions.data || []) {
    const key = `${row.plan_id || "unknown"}:${row.status || "unknown"}`;
    subscriptionSummary[key] = (subscriptionSummary[key] || 0) + 1;
  }

  return NextResponse.json({
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
  });
}

