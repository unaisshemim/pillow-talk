import { supabase } from "./supabaseClient";

export async function createLobbyInDb(creator_id: string) {
  const { data: existingLobby, error: findError } = await supabase
    .from("lobbies")
    .select("*")
    .eq("creator_id", creator_id)
    .in("status", ["pending", "active"])
    .maybeSingle();
  if (findError) throw findError;
  if (existingLobby) return existingLobby;
  const { data, error } = await supabase
    .from("lobbies")
    .insert([{ creator_id, status: "pending" }])
    .select();
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

export async function joinLobbyInDb(lobby_id: string, partner_id: string) {
  const { data, error } = await supabase
    .from("lobbies")
    .update({ partner_id, status: "active" })
    .eq("id", lobby_id)
    .select()
    .single();
  if (error) {
    console.error("joinLobbyInDb error:", error);
    return null;
  }
  return data;
}

export async function getLobbyByUserId(userId: string) {
  const { data, error } = await supabase
    .from("lobbies")
    .select("*")
    .or(`creator_id.eq.${userId},partner_id.eq.${userId}`)
    .maybeSingle();
  if (error) throw error;
  return data;
}
