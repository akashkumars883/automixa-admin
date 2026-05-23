import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import AnalyticsClient from "./AnalyticsClient";

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  // Fetch real automation history
  const { data: history, error } = await supabase
    .from("automation_history")
    .select("status, created_at, automation_id")
    .limit(1000); // Last 1000 for realistic calc

  if (error && error.code !== "42P01") {
    console.error("Error fetching history:", error);
  }

  const logs = history || [];
  const totalMessages = logs.length.toString();
  const successes = logs.filter(l => l.status === 'success').length;
  const successRate = logs.length > 0 ? Math.round((successes / logs.length) * 100) + "%" : "0%";

  // Calculate engagement by status
  const statusCounts: Record<string, number> = {};
  logs.forEach(l => {
    statusCounts[l.status || "unknown"] = (statusCounts[l.status || "unknown"] || 0) + 1;
  });
  const engagementData = Object.keys(statusCounts).map(k => ({ name: k, value: statusCounts[k] }));

  // Group by day of week for trends
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayCounts: Record<string, number> = { "Sun": 0, "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0 };
  
  logs.forEach(l => {
    if (l.created_at) {
      const date = new Date(l.created_at);
      const day = daysOfWeek[date.getDay()];
      dayCounts[day] += 1;
    }
  });

  const conversionData = daysOfWeek.map(day => ({ name: day, count: dayCounts[day] }));

  // Calculate unique automations as a proxy for Unique Leads
  const uniqueLeads = new Set(logs.map(l => l.automation_id).filter(Boolean)).size.toString();
  const linkClicks = "0";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Analytics Panel</h1>
        <p className="mt-1 text-slate-400">Deep dive into automation performance based on actual DB records.</p>
      </div>

      <AnalyticsClient 
        totalMessages={totalMessages}
        successRate={successRate}
        linkClicks={linkClicks}
        uniqueLeads={uniqueLeads}
        conversionData={conversionData}
        engagementData={engagementData}
        messageTimingData={[]}
      />
    </div>
  );
}
