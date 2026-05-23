"use server";

import { createAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateSeoSettings(settings: { key: string, value: string }[]) {
  const supabase = createAdminClient();
  
  for (const setting of settings) {
    const { error } = await supabase
      .from("seo_settings")
      .update({ setting_value: setting.value })
      .eq("setting_key", setting.key);
      
    if (error) {
      console.error("Failed to update setting", setting.key, error);
      return { success: false, error: error.message };
    }
  }

  revalidatePath("/admin/marketing/seo");
  return { success: true };
}
