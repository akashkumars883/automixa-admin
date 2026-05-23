"use server";

import { createAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createBlogPost(data: { title: string, slug: string, excerpt: string, content: string, status: string }) {
  const supabase = createAdminClient();
  const { data: inserted, error } = await supabase
    .from("blog_posts")
    .insert([{
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      status: data.status,
      published_at: data.status === "published" ? new Date().toISOString() : null
    }])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath("/admin/marketing/blog");
  return { success: true, data: inserted };
}

export async function updateBlogPost(id: string, data: { title: string, slug: string, excerpt: string, content: string, status: string }) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      status: data.status,
      published_at: data.status === "published" ? new Date().toISOString() : null
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath("/admin/marketing/blog");
  return { success: true };
}

export async function deleteBlogPost(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  
  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath("/admin/marketing/blog");
  return { success: true };
}
