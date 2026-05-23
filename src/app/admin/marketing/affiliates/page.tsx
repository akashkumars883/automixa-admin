import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import { DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ModalTrigger from "@/components/admin/ModalTrigger";

export default async function AdminAffiliatesPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  // Fetch real partner profiles from Supabase
  const { data: partners, error } = await supabase
    .from("partner_profiles")
    .select("id, social_handle, active_tier, total_referrals_count, total_paid_earnings")
    .order("total_paid_earnings", { ascending: false });

  if (error && error.code !== "42P01") {
    console.error("Error fetching partner profiles:", error);
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/marketing" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-blue-400" /> Affiliate Manager
          </h1>
          <p className="mt-1 text-slate-400">Track partner performance and manage payouts.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-6">All Active Affiliates</h2>
        <div className="overflow-x-auto p-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/50">
              <tr className="text-slate-300">
                <th className="px-4 py-3 font-medium">Partner Handle</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Total Referrals</th>
                <th className="px-4 py-3 font-medium">Total Earnings</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {partners?.map((partner) => (
                <tr key={partner.id} className="transition-colors hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-200">{partner.social_handle || "Unknown"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full uppercase">
                      {partner.active_tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{partner.total_referrals_count}</td>
                  <td className="px-4 py-3 text-emerald-400 font-medium">${partner.total_paid_earnings}</td>
                  <td className="px-4 py-3 text-right">
                    <ModalTrigger
                      buttonText="View Payouts"
                      title="Partner Payouts"
                      message={`Viewing payout history and statements for ${partner.social_handle || "Unknown"}.`}
                      className="text-xs font-medium text-blue-400 hover:text-blue-300 mr-3"
                    />
                    <ModalTrigger
                      buttonText="Upgrade Tier"
                      title="Upgrade Partner Tier"
                      message={`Promote ${partner.social_handle || "Unknown"} to the next affiliate tier?`}
                      className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                    />
                  </td>
                </tr>
              ))}
              {(!partners || partners.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No affiliate data found. Real data will appear here once partners sign up.
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
