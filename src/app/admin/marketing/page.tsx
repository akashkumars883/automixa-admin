import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import { Megaphone, PenTool, Globe, DollarSign } from "lucide-react";

export default async function AdminMarketingPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  const [blogCountResult, seoCountResult, affiliateCountResult] = await Promise.all([
    supabase.from("blogs").select("id", { count: "exact", head: true }),
    supabase.from("seo_settings").select("id", { count: "exact", head: true }),
    supabase.from("partner_profiles").select("id", { count: "exact", head: true }),
  ]);

  const blogCount = blogCountResult.count ?? 0;
  const seoCount = seoCountResult.count ?? 0;
  const affiliateCount = affiliateCountResult.count ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Megaphone className="w-8 h-8 text-fuchsia-400" /> Marketing & SEO
        </h1>
        <p className="mt-1 text-slate-400">Manage your blog, track affiliates, and optimize platform SEO.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Blog Posts</p>
          <p className="mt-4 text-4xl font-bold text-white">{blogCount}</p>
          <p className="mt-2 text-sm text-slate-400">Live blog count from the DB.</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">SEO Rules</p>
          <p className="mt-4 text-4xl font-bold text-white">{seoCount}</p>
          <p className="mt-2 text-sm text-slate-400">SEO settings and meta entries.</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Affiliates</p>
          <p className="mt-4 text-4xl font-bold text-white">{affiliateCount}</p>
          <p className="mt-2 text-sm text-slate-400">Partner profiles live from Supabase.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/marketing/blog" className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl flex items-center gap-4 hover:bg-white/5 transition-colors group">
          <div className="p-3 bg-fuchsia-500/10 rounded-xl group-hover:scale-110 transition-transform">
            <PenTool className="w-6 h-6 text-fuchsia-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 group-hover:text-fuchsia-400 transition-colors">Blog Manager</h3>
            <p className="text-xs text-slate-400">Write & edit articles</p>
          </div>
        </Link>

        <Link href="/admin/marketing/seo" className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl flex items-center gap-4 hover:bg-white/5 transition-colors group">
          <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
            <Globe className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">SEO Tools</h3>
            <p className="text-xs text-slate-400">Sitemap & Meta Tags</p>
          </div>
        </Link>

        <Link href="/admin/marketing/affiliates" className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl flex items-center gap-4 hover:bg-white/5 transition-colors group">
          <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
            <DollarSign className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">Affiliates</h3>
            <p className="text-xs text-slate-400">View active partners</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
