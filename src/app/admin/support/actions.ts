"use server";

import { createAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateTicketStatus(ticketId: string, newStatus: string) {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from("support_tickets")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) {
    console.error("Error updating ticket:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/support");
  return { success: true };
}
