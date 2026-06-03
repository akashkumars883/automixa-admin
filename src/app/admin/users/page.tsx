import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import ModalTrigger from "@/components/admin/ModalTrigger";
import ImpersonateButton from "./ImpersonateButton";
import ExportCSVButton from "@/components/admin/ExportCSVButton";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  // Fetch users using the Admin API (requires Service Role Key)
  const { data: authData, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  if (error) {
    return (
      <div className="mt-6 rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
        Failed to load users from Auth. {error.message}
      </div>
    );
  }

  const users = authData?.users || [];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Users</h1>
          <p className="mt-1 text-slate-400">Manage all registered Automixa users ({users.length} total).</p>
        </div>
        <ExportCSVButton data={users} filename="automixa_users" />
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto p-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/50">
              <tr className="text-slate-300">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Last Sign In</th>
                <th className="px-4 py-3 font-medium">Created At</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {users.map((user) => {
                const name = user.user_metadata?.full_name || user.user_metadata?.name || "—";
                return (
                  <tr key={user.id} className="transition-colors hover:bg-slate-800/50 group">
                    <td className="px-4 py-3 font-medium text-slate-200">{user.email || "No email"}</td>
                    <td className="px-4 py-3 text-slate-200">{name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      <div className="max-w-[120px] truncate" title={user.id}>
                        {user.id}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Never"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {user.created_at ? new Date(user.created_at).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right flex items-center justify-end">
                       <ImpersonateButton email={user.email} />
                       <ModalTrigger
                         buttonText="View Details"
                         title="User Details"
                         message={`ID: ${user.id}\nEmail: ${user.email || "No email"}\nName: ${name}\nLast Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Never"}\nCreated At: ${user.created_at ? new Date(user.created_at).toLocaleString() : "-"}`}
                         className="text-xs font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-300 mr-3"
                       />
                       <ModalTrigger
                         buttonText="Suspend"
                         title="Suspend User"
                         message={`Are you sure you want to suspend user ${user.email} (${name})? They will immediately lose access to their account.`}
                         className="text-xs font-medium text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-300"
                       />
                    </td>
                  </tr>
                );
              })}
              {!users.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No users found.
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
