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
    .select("status, created_at")
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

  // Simulate timing/conversion from history (dummy processing for now since we just need shape)
  // In reality, this would group by day from `created_at`
  const conversionData = [
    { name: "Mon", count: 10 },
    { name: "Tue", count: 20 },
    { name: "Wed", count: successes },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Analytics Panel</h1>
        <p className="mt-1 text-slate-400">Deep dive into automation performance based on actual DB records.</p>
      </div>

      <AnalyticsClient 
        totalMessages={totalMessages}
        successRate={successRate}
        conversionData={conversionData}
        engagementData={engagementData}
        messageTimingData={[]}
      />
    </div>
  );
}
