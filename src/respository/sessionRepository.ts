import { supabase } from "../config/supabaseClient";
import { SessionRole } from "../enums/sessionRole";
import { Metadata } from "../types/lightweightMetadata";
import { SessionStatus } from "../enums/sessionRole";

// ✅ Create a new session
export async function createSessionInDb(session: {
  lobby_id: string;
  user_id: string;
  role: SessionRole;
  title: string;
  parent_session_id?: string;
}) {
  const { data, error } = await supabase
    .from("sessions")
    .insert([session])
    .select();

  if (error) throw error;
  console.log(error)
  return data?.[0] || null;
}

// ✅ Mark session complete
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
  const { data, error } = await supabase
    .from("sessions")
    .update({
      ...update,
      is_completed: true,
      ended_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data?.[0] || null;
}

// ✅ Get all sessions for a user
export async function getSessionsByUserId(user_id: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ✅ Get session by session ID
export async function getSessionById(id: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ✅ Delete session by ID
export async function deleteSessionById(id: string) {
  // Delete all messages associated with the session
  const { error: messageError } = await supabase
    .from("messages")
    .delete()
    .eq("session_id", id);

  if (messageError) throw messageError;

  // Delete the session itself
  const { error: sessionError } = await supabase
    .from("sessions")
    .delete()
    .eq("id", id);

  if (sessionError) throw sessionError;
  return { success: true };
}

// ✅ Get sessions by lobby ID
export async function getSessionsByLobbyId(lobby_id: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("lobby_id", lobby_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ✅ Get the latest session ID by user
export async function getSessionIdByUserId(
  user_id: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("id")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.id || null;
}

// ✅ Get user ID by session ID (NEW)
export async function getUserIdBySessionId(
  session_id: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("user_id")
    .eq("id", session_id)
    .maybeSingle();

  if (error) throw error;
  return data?.user_id || null;
}
export async function updateSessionRole(sessionId: string, role: SessionRole) {
  const { data, error } = await supabase
    .from("sessions")
    .update({ role })
    .eq("id", sessionId)
    .select();
  if (error) throw error;
  return data?.[0] || null;
}

export async function updateReportId(
  reportId: string,
  currentSessionId: string,
  partnerSessionId: string
) {
  const { data, error } = await supabase
    .from("sessions")
    .update({ report_id: reportId })
    .in("id", [currentSessionId, partnerSessionId]);

  if (error) throw error;
  console.log(error)
  return data?.[0] || null;
}

export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus
) {
  const { data, error } = await supabase
    .from("sessions")
    .update({ status: status })
    .eq("id", sessionId);
  if (error) throw error;

  return data?.[0] || null;
}
