import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import BroadcastsClient from "./BroadcastsClient";

export default async function AdminBroadcastsPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  const { data: broadcasts, error } = await supabase
    .from("system_broadcasts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error && error.code !== "42P01") {
    console.error("Error fetching broadcasts:", error);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">System Broadcasts</h1>
        <p className="mt-1 text-slate-400">Send platform-wide notifications and alerts to all users.</p>
      </div>

      <BroadcastsClient initialBroadcasts={broadcasts || []} />
    </div>
  );
}
