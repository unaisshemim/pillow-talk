
import { supabase } from "../config/supabaseClient";
import { Metadata } from "../types/lightweightMetadata";
import { MessageRequest } from "../types/message";

export async function saveMessageToDb(message: MessageRequest) {
  // Assign message_index only for user messages
  if (message.role === "user") {
    const { data: maxRow, error: fetchError } = await supabase
      .from("messages")
      .select("message_index")
      .eq("session_id", message.session_id)
      .eq("role", "user")
      .order("message_index", { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    const latestIndex = maxRow?.message_index || 0;
    message.message_index = latestIndex + 1;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert([message])
    .select();

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

export async function getAllMessagesBySessionId(session_id: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", session_id)
    .order("create_at", { ascending: true });
  if (error) throw error;

  return data;
}
export async function getUnsummaryUserMessageCount(
  session_id: string
): Promise<number> {
  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session_id)
    .eq("role", "user")
    .eq("is_summarized", false);
  if (error) throw error;
  return count || 0;
}
export async function getLastTenMessagesMetadataBySessionId(
  session_id: string,
  limit: number = 10
): Promise<Array<{ id: string; metadata: Metadata }>> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, metadata")
    .eq("session_id", session_id)
    .eq("role", "user")
    .eq("is_summarized", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Array<{ id: string; metadata: Metadata }>;
}

export async function markMessagesAsSummarized(messageIds: string[]): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ is_summarized: true })
    .in("id", messageIds);

  if (error) throw error;
}

