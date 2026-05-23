import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (token && existing === token) {
    redirect("/admin/overview");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl shadow-2xl">
        <div className="text-2xl font-bold tracking-tight text-white">Automixa Admin</div>
        <div className="mt-2 text-sm text-slate-400 mb-6">
          Sign in to view dashboard data.
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

