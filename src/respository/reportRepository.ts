import { supabase } from "../config/supabaseClient";
import { Report } from "../types/report";

// Insert a new report and return the inserted row
export async function generateReport(
  report: Omit<Report, "id" | "created_at">
): Promise<Report> {
  const { data, error } = await supabase
    .from("reports")
    .insert([report])
    .select();
  if (error) throw error;

  return data[0];
}

// Get a report by id
export async function getReportById(id: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}
