import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import ExportCSVButton from "@/components/admin/ExportCSVButton";

export default async function AdminOnboardingLogsPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  // Fetch all onboarding email logs
  const { data: logs, error: logsError } = await supabase
    .from("onboarding_emails")
    .select("*")
    .order("sent_at", { ascending: false });

  // Fetch automations to determine connected status
  const { data: automations } = await supabase
    .from("automations")
    .select("user_id");

  // Fetch workspaces to map signup (creation) date
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("user_id, created_at")
    .order("created_at", { ascending: true });

  if (logsError) {
    return (
      <div className="mt-6 rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
        Failed to load onboarding email logs. {logsError.message}
      </div>
    );
  }

  const emailLogs = logs || [];
  const connectedUserIds = new Set((automations || []).map((a) => a.user_id));

  // Map workspace created_at as signup date
  const signupDates = new Map();
  for (const w of workspaces || []) {
    if (!signupDates.has(w.user_id)) {
      signupDates.set(w.user_id, w.created_at);
    }
  }

  // Calculate statistics
  const totalSent = emailLogs.length;
  const welcomeCount = emailLogs.filter((l) => l.email_type === "welcome").length;
  const nudge2hCount = emailLogs.filter((l) => l.email_type === "nudge_2h").length;
  const caseStudyCount = emailLogs.filter((l) => l.email_type === "case_study_24h").length;
  const feedbackCount = emailLogs.filter((l) => l.email_type === "feedback_72h").length;

  const uniqueUsers = new Set(emailLogs.map((l) => l.user_id));
  let activatedCount = 0;
  for (const uid of uniqueUsers) {
    if (connectedUserIds.has(uid)) {
      activatedCount++;
    }
  }
  const activationRate = uniqueUsers.size > 0 ? ((activatedCount / uniqueUsers.size) * 100).toFixed(1) : "0.0";

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Onboarding Emails</h1>
          <p className="mt-1 text-slate-400">Track and monitor automated onboarding and nudge emails sent to users.</p>
        </div>
        <ExportCSVButton data={emailLogs} filename="onboarding_email_logs" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 shadow-md">
          <div className="text-sm font-medium text-slate-400">Total Nudges Sent</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalSent}</span>
            <span className="text-xs text-slate-500">emails</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 shadow-md">
          <div className="text-sm font-medium text-slate-400">Campaign Sequences</div>
          <div className="mt-2 text-xs text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span>Welcome (0h):</span>
              <span className="font-semibold text-slate-100">{welcomeCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Nudge (2h):</span>
              <span className="font-semibold text-slate-100">{nudge2hCount}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 shadow-md">
          <div className="text-sm font-medium text-slate-400">Retention Sequences</div>
          <div className="mt-2 text-xs text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span>Case Study (24h):</span>
              <span className="font-semibold text-slate-100">{caseStudyCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Feedback (72h):</span>
              <span className="font-semibold text-slate-100">{feedbackCount}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 shadow-md">
          <div className="text-sm font-medium text-slate-400 font-semibold text-emerald-400">Nudge Activation Rate</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400">{activationRate}%</span>
            <span className="text-xs text-slate-500">({activatedCount} / {uniqueUsers.size} users)</span>
          </div>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto p-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/50">
              <tr className="text-slate-300">
                <th className="px-4 py-3 font-medium">User Email</th>
                <th className="px-4 py-3 font-medium">Email Type</th>
                <th className="px-4 py-3 font-medium">Instagram Status</th>
                <th className="px-4 py-3 font-medium">Signup Date</th>
                <th className="px-4 py-3 font-medium">Sent At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {emailLogs.map((log) => {
                const isConnected = connectedUserIds.has(log.user_id);
                const signupTime = signupDates.get(log.user_id);

                // Define badges for email type
                let typeBadge = "";
                if (log.email_type === "welcome") {
                  typeBadge = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                } else if (log.email_type === "nudge_2h") {
                  typeBadge = "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
                } else if (log.email_type === "case_study_24h") {
                  typeBadge = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                } else {
                  typeBadge = "bg-slate-500/10 text-slate-400 border border-slate-500/20";
                }

                // Render email type name nicely
                let typeName = log.email_type;
                if (log.email_type === "welcome") typeName = "Welcome (0h)";
                else if (log.email_type === "nudge_2h") typeName = "Nudge (2h)";
                else if (log.email_type === "case_study_24h") typeName = "Case Study (24h)";
                else if (log.email_type === "feedback_72h") typeName = "Feedback (72h)";

                return (
                  <tr key={log.id} className="transition-colors hover:bg-slate-800/30 group">
                    <td className="px-4 py-3.5 font-medium text-slate-200">{log.user_email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${typeBadge}`}>
                        {typeName}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {isConnected ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          🟢 Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          🔴 Not Connected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      {signupTime ? new Date(signupTime).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      {log.sent_at ? new Date(log.sent_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                );
              })}
              {!emailLogs.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No onboarding emails sent yet.
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
