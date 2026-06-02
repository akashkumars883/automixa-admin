import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import PricingClient from "./PricingClient";
import SubscriptionOverride from "./SubscriptionOverride";

export default async function AdminBillingPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  // Fetch real subscriptions
  const { data: subs, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error && error.code !== "42P01") {
    console.error("Error fetching subs:", error);
  }

  // Fetch real invoices
  const { data: invoices, error: invError } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });
    
  if (invError && invError.code !== "42P01") {
    console.error("Error fetching invoices:", invError);
  }

  // Fetch Pricing Plans
  const { data: pricingPlans, error: pricingError } = await supabase
    .from("pricing_plans")
    .select("*")
    .order("display_order", { ascending: true });

  if (pricingError && pricingError.code !== "42P01") {
    console.error("Error fetching pricing plans:", pricingError);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Billing & Plans</h1>
        <p className="mt-1 text-slate-400">View and manage actual user subscriptions and billing logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-4">Active Subscriptions</h2>
          <div className="overflow-x-auto p-1">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/50">
                <tr className="text-slate-300">
                  <th className="px-4 py-3 font-medium">User ID</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {subs?.map((sub) => (
                  <tr key={sub.id} className="transition-colors hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{sub.user_id?.substring(0, 8)}...</td>
                    <td className="px-4 py-3 text-slate-200 capitalize">{sub.plan_id}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!subs || subs.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                      No subscriptions found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Invoices</h2>
          <div className="overflow-x-auto p-1">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/50">
                <tr className="text-slate-300">
                  <th className="px-4 py-3 font-medium">Invoice #</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {invoices?.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-slate-200">{inv.amount} {inv.currency}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!invoices || invoices.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                      No invoices found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Manual Subscription Override */}
        <SubscriptionOverride />
        
        {/* Dynamic Pricing Manager */}
        <PricingClient initialPlans={pricingPlans || []} />
      </div>
    </div>
  );
}
