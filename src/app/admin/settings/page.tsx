import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import SettingsClient from "./SettingsClient";

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  const { data: settings, error } = await supabase
    .from("global_settings")
    .select("*")
    .order("key", { ascending: true });

  if (error && error.code !== "42P01") {
    console.error("Error fetching global settings:", error);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Global Settings</h1>
        <p className="mt-1 text-slate-400">Manage platform-wide configuration and toggles.</p>
      </div>

      <SettingsClient initialSettings={settings || []} />
    </div>
  );
}
