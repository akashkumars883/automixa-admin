import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import SeoClient from "./SeoClient";

export default async function AdminSeoPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  const { data: settings, error } = await supabase
    .from("seo_settings")
    .select("*");

  if (error && error.code !== "42P01") {
    console.error("Error fetching seo settings:", error);
  }

  return (
    <SeoClient initialSettings={settings || []} />
  );
}
