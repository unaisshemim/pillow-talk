// Get the last saved index for a user (max index)

import { supabase } from "../config/supabaseClient";
import { Reflection } from "../types/reflection";

import { RefelctionSourceType } from "../enums/RefelectionRole";

// Get the latest incomplete self reflection for a user
export async function getLatestIncompleteSelfReflection(
  user_id: string
): Promise<Reflection | null> {
  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .eq("user_id", user_id)
    .eq("source_type", RefelctionSourceType.SelfBlueprint)
    .eq("is_completed", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

// Save a new reflection (is_completed = false by default)
export async function createNewSelfReflection({
  user_id,
  question,
  index,
  source_type = RefelctionSourceType.SelfBlueprint,
  partner_id,
}: {
  user_id: string;
  question: string;
  index: number;
  source_type?: RefelctionSourceType;
  partner_id?: string;
}): Promise<Reflection> {
  const { data, error } = await supabase
    .from("reflections")
    .insert([
      {
        user_id,
        question,
        index,
        source_type,
        is_completed: false,
        partner_id,
      },
    ])
    .select();
  if (error) throw error;
  return data[0];
}

export async function saveReflection(
  reflection: Reflection
): Promise<Reflection> {
  const { data, error } = await supabase
    .from("reflections")
    .insert([reflection])
    .select();
  if (error) throw error;
  return data && data.length > 0 ? data[0] : reflection;
}
export async function getLastReflectionIndex(user_id: string): Promise<number> {
  const { data, error } = await supabase
    .from("reflections")
    .select("index")
    .eq("user_id", user_id)
    .order("index", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.index ?? 0;
}
