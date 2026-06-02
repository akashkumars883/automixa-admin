import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import BlogClient from "./BlogClient";

export default async function AdminBlogPage() {
  const cookieStore = await cookies();
  const token = getAdminSessionToken();
  const existing = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || existing !== token) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  const { data: posts, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error && error.code !== "42P01") {
    console.error("Error fetching blogs:", error);
  }

  // Map DB fields to what BlogClient expects
  // DB has "description" but BlogClient expects "excerpt"
  // DB has no "status" field, default to "published"
  const mappedPosts = (posts || []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    title: p.title as string,
    slug: p.slug as string,
    excerpt: (p.description as string) || null,
    content: p.content as string,
    status: (p.status as string) || "published",
  }));

  return (
    <BlogClient initialPosts={mappedPosts} />
  );
}
