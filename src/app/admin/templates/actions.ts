"use server";

import { createAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createTemplate(data: { title: string; category: string; description: string; content: string; is_premium: boolean; is_active: boolean }) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("content_templates").insert(data);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/templates");
  return { success: true };
}

export async function updateTemplate(id: string, data: { title: string; category: string; description: string; content: string; is_premium: boolean; is_active: boolean }) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("content_templates").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/templates");
  return { success: true };
}

export async function deleteTemplate(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("content_templates").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/templates");
  return { success: true };
}
