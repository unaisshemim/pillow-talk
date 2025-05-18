
import { supabase } from "../config/supabaseClient";
import { MessageRequest } from "../types/message";

export async function saveMessageToDb(message: MessageRequest) {
  const { data, error } = await supabase
    .from("messages")
    .insert([message])
    .select();
  if (error) throw error;
  console.log("getMessagesBySessionId", { data, error });
  return data && data.length > 0 ? data[0] : null;
}

export async function getMessagesBySessionId(session_id: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", session_id)
    .order("timestamp", { ascending: true });
  console.log("getMessagesBySessionId", { data, error });
  if (error) throw error;

  return data;
}
