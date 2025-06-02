import { create } from "domain";
import { supabase } from "../config/supabaseClient";

export async function createLobbyInDb(creator_id: string) {
  // Check for existing active or pending lobby
  const { data: existingLobby, error: findError } = await supabase
    .from("lobbies")
    .select("*")
    .eq("creator_id", creator_id)
    .in("status", ["pending", "active"])
    .maybeSingle();

  if (findError) throw findError;
  if (existingLobby) return existingLobby;

  // Generate 6-char unique code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data, error } = await supabase
    .from("lobbies")
    .insert([{ creator_id, status: "pending", code }])
    .select();

  if (error) throw error;

  return data && data.length > 0 ? data[0] : null;
}

export async function joinLobbyByCodeInDb(code: string, partner_id: string) {
  const { data: lobby, error: findError } = await supabase
    .from("lobbies")
    .select("*")
    .eq("code", code)
    .eq("status", "pending")
    .maybeSingle();

  if (findError || !lobby) throw new Error("Lobby not found or already active");

  if (lobby.creator_id === partner_id)
    throw new Error("You cannot join your own lobby");

  // Optional: ensure user is not already in another lobby
  const { data: existing, error: existingError } = await supabase
    .from("lobbies")
    .select("*")
    .or(`creator_id.eq.${partner_id},partner_id.eq.${partner_id}`)
    .in("status", ["active"])
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) throw new Error("You are already connected to another lobby");

  // ✅ Abandon any pending lobby created by this partner
  await supabase
    .from("lobbies")
    .update({ status: "abandoned" })
    .eq("creator_id", partner_id)
    .eq("status", "pending");

  // ✅ Join the target lobby
  const { data, error } = await supabase
    .from("lobbies")
    .update({
      partner_id,
      status: "active",
      connected_at: new Date().toISOString(),
    })
    .eq("id", lobby.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLobbyByUserId(userId: string) {
  
  const { data, error } = await supabase
    .from("lobbies")
    .select(`
      *,
      creator:creator_id ( id, name ),
      partner:partner_id ( id, name )
    `)
    .or(`creator_id.eq.${userId},partner_id.eq.${userId}`)
    .in("status", ["active"])
    .order("status", { ascending: false }) // active > pending
    .order("created_at", { ascending: false }) // latest first
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}
