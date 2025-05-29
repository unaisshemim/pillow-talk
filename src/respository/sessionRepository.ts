// Get all session IDs for a user

import { supabase } from "../config/supabaseClient";
import { SessionRole } from "../enums/sessionRole";
import { Metadata } from "../types/lightweightMetadata";

export async function createSessionInDb(session: {
  lobby_id: string;
  user_id: string;
  role: SessionRole;
}) {
  const { data, error } = await supabase
    .from("sessions")
    .insert([session])
    .select();
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}
export async function completeSessionInDb(
  id: string,
  update: {
    summary?: string;
    embedding_id?: string;
    metadata?: Metadata;
    report?: string;
    advice?: string;
  }
) {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .update({
        ...update,
        status: "completed",
        is_completed: true,
        ended_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();
    if (error) throw error;

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getSessionsByUserId(user_id: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });
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
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
export async function getSessionIdByUserId(
  user_id: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("id")
    .eq("user_id", user_id)
    .maybeSingle();
  if (error) throw error;

  return data ? data.id : null;
}
