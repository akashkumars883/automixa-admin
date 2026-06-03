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
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/80">
        <div 
          className="text-2xl font-bold tracking-tight text-slate-900"
          style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
        >
          Automixa Admin
        </div>
        <div className="mt-2 text-sm text-slate-500 mb-6">
          Sign in to view dashboard data.
        </div>
        <LoginForm />
      </div>
    </div>
  );
}


