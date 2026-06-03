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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUrl = `${appUrl.replace(/\/+$/, "")}/dashboard`;

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email,
      options: {
        redirectTo: redirectUrl
      }
    });

    if (error) throw error;

    // The generated link usually points to the Supabase Auth endpoint
    const url = data?.properties?.action_link;

    // Check if the redirect URL was rewritten by Supabase due to allowlist config
    let warning: string | null = null;
    if (url) {
      try {
        const parsedUrl = new URL(url);
        const actualRedirect = parsedUrl.searchParams.get("redirect_to");
        if (actualRedirect && actualRedirect !== redirectUrl) {
          warning = `The redirect URL '${redirectUrl}' is not in the allowed Redirect URLs list in your Supabase Dashboard (Authentication > URL Configuration). Supabase fell back to '${actualRedirect}'.`;
        }
      } catch (err) {
        console.error("Failed to parse action_link URL:", err);
      }
    }

    return NextResponse.json({ url, warning });
  } catch (error: any) {
    console.error("Impersonation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
