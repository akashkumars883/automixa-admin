import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import { LifeBuoy, CheckCircle2, MessageCircle, AlertCircle, Clock } from "lucide-react";
import SupportClient from "./SupportClient";

export default async function AdminSupportPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  // Fetch real support tickets from Supabase
  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select("*, auth_users:user_id(email)")
    .order("created_at", { ascending: false });

  if (error && error.code !== "42P01") {
    console.error("Error fetching tickets:", error);
  }

  const activeTickets = tickets?.filter(t => t.status !== 'resolved' && t.status !== 'closed') || [];
  const openTickets = tickets?.filter(t => t.status === 'open') || [];
  const inProgress = tickets?.filter(t => t.status === 'in_progress') || [];
  const resolved = tickets?.filter(t => t.status === 'resolved') || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <LifeBuoy className="w-8 h-8 text-rose-400" /> Support Desk
        </h1>
        <p className="mt-1 text-slate-400">Manage user issues, feature requests, and account deletions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Active", value: activeTickets.length, icon: MessageCircle, color: "text-blue-400" },
          { title: "Open", value: openTickets.length, icon: AlertCircle, color: "text-amber-400" },
          { title: "In Progress", value: inProgress.length, icon: Clock, color: "text-indigo-400" },
          { title: "Resolved", value: resolved.length, icon: CheckCircle2, color: "text-emerald-400" },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">{stat.title}</p>
              <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl bg-white/5`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl flex flex-col h-[600px] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">All Tickets</h2>
        </div>
        
        {/* Pass the tickets to a Client Component for interactive filtering/updating */}
        <SupportClient initialTickets={tickets || []} />
      </div>
    </div>
  );
}
