import { supabase } from "../config/supabaseClient";
import { SessionRole } from "../enums/sessionRole";


export async function createSessionInDb(session: {
  lobby_id: string;
  user_id: string;
  role: SessionRole;
}) {
  const { data, error } = await supabase
    .from("sessions")
    .insert([{ ...session, timestamp: new Date().toISOString() }])
    .select();
  console.log("createSessionInDb", { data, error });
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

export async function completeSessionInDb(
  id: string,
  update: {
    summary?: string;
    tone?: string;
    topics?: string[];
    embedding_id?: string;
  }
) {
  const { data, error } = await supabase
    .from("sessions")
    .update({
      ...update,
      status: "completed",
      ended_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

export async function getSessionsByUserId(user_id: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user_id)
    .order("timestamp", { ascending: false });
  console.log("getSessionsByUserId", { data, error });
  if (error) throw error;
  return data;
}

export async function getSessionById(id: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteSessionById(id: string) {
  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

export async function getSessionsByLobbyId(lobby_id: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("lobby_id", lobby_id)
    .order("timestamp", { ascending: false });
  console.log("getSessionsByLobbyId", { data, error });
  if (error) throw error;
  return data;
}
