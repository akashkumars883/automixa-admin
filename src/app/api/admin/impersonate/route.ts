import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = getAdminSessionToken();
    const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    
    if (!token || existing !== token) {
      return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // Generate a magic link for the user that redirects to the dashboard
    // We assume the main app runs on localhost:3000 in dev or automixa.in in prod
    const isDev = process.env.NODE_ENV === "development";
    const redirectUrl = isDev ? "http://localhost:3000/dashboard" : "https://automixa.in/dashboard";

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email,
      options: {
        redirectTo: redirectUrl
      }
    });

    if (error) throw error;

    // The generated link usually points to the Supabase Auth endpoint
    // It looks like: https://[project].supabase.co/auth/v1/verify?token=...
    // When the admin clicks it, they will be authenticated as the user and redirected to the main app dashboard
    const url = data?.properties?.action_link;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Impersonation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
