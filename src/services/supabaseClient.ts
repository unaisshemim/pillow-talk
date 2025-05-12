import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { Lobby } from "../types/lobby";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a new lobby
export async function createLobbyInDb(creator_id: string) {
  // Check if a lobby already exists for this creator_id
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

// Join a lobby as partner
export async function joinLobbyInDb(lobby_id: string, partner_id: string) {
  // Set partner_id and status to 'active'
  const { data, error } = await supabase
    .from("lobbies")
    .update({ partner_id, status: "active" })
    .eq("id", lobby_id)
    .select()
    .single();
  
    if (error) {
        console.error("joinLobbyInDb error:", error);
        return null;
      }  return data;
}

// Get lobby by userId (either as creator or partner)
export async function getLobbyByUserId(userId: string) {
  const { data, error } = await supabase
    .from("lobbies")
    .select("*")
    .or(`creator_id.eq.${userId},partner_id.eq.${userId}`)
    .maybeSingle();
  if (error) throw error;
  return data;
}
