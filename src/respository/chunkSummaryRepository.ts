import { supabase } from "../config/supabaseClient";
import { ChunkSummary } from "../types/chunkSummary";

export async function addChunkSummary(chunkSummary: ChunkSummary) {
  const { data, error } = await supabase
    .from("chunk_summaries")
    .insert([chunkSummary])
    .select();
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

export async function getChunksBySessionId(sessionId: string) {
  const { data, error } = await supabase
    .from("chunk_summaries")
    .select("*")
    .eq("session_id", sessionId)
    .order("chunk_index", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getLatestChunkIndex(sessionId: string) {
  const { data, error } = await supabase
    .from("chunk_summaries")
    .select("chunk_index")
    .eq("session_id", sessionId)
    .order("chunk_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? data.chunk_index : 0;
}


export async function deleteChunksForSession(sessionId: string) {
  const { data, error } = await supabase
    .from("chunk_summaries")
    .delete()
    .eq("session_id", sessionId);
  if (error) throw error;
  return data;
}
