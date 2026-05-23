import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import { FileText, Plus } from "lucide-react";
import TemplatesClient from "./TemplatesClient";

export default async function AdminTemplatesPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  // Fetch real templates from Supabase
  const { data: templates, error } = await supabase
    .from("content_templates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error && error.code !== "42P01") {
    console.error("Error fetching templates:", error);
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-fuchsia-400" /> Templates Library
          </h1>
          <p className="mt-1 text-slate-400">Create and manage content templates for users.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl p-6">
        <TemplatesClient initialTemplates={templates || []} />
      </div>
    </div>
  );
}
