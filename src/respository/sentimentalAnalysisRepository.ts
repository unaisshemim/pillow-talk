import { supabase } from "../config/supabaseClient";
import { SentimentalAnalysis } from "../types/reflection";

// Insert a new sentimental analysis row
export async function insertSentimentalAnalysis(
  row: SentimentalAnalysis
): Promise<SentimentalAnalysis> {
  const { data, error } = await supabase
    .from("sentimental_analysis")
    .insert([row])
    .select();
  if (error) throw error;
  return data && data.length > 0 ? data[0] : row;
}

// Get sentimental analysis by id
export async function getSentimentalAnalysisById(
  id: string
): Promise<SentimentalAnalysis | null> {
  const { data, error } = await supabase
    .from("sentimental_analysis")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

// Get all sentimental analysis rows for a user (optionally filtered by analyzed_user_id)
export async function getSentimentalAnalysesForUser(
  user_id: string,
  analyzed_user_id?: string
): Promise<SentimentalAnalysis[]> {
  let query = supabase
    .from("sentimental_analysis")
    .select("*")
    .eq("user_id", user_id);
  if (analyzed_user_id) {
    query = query.eq("analyzed_user_id", analyzed_user_id);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
