"use server";

import { createAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createBlogPost(data: { title: string, slug: string, excerpt: string, content: string, status: string }) {
  const supabase = createAdminClient();
  const { data: inserted, error } = await supabase
    .from("blogs")
    .insert([{
      title: data.title,
      slug: data.slug,
      description: data.excerpt,
      content: data.content,
      category: "General",
      author: "Automixa Team",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1200&auto=format&fit=crop",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
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
    .from("blogs")
    .update({
      title: data.title,
      slug: data.slug,
      description: data.excerpt,
      content: data.content
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
  const { error } = await supabase.from("blogs").delete().eq("id", id);
  
  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath("/admin/marketing/blog");
  return { success: true };
}
