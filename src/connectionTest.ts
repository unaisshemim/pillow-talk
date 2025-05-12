import { supabase } from "./services/supabaseClient";


// Test Supabase connection
export async function testSupabaseConnection() {
  try {
    const { error } = await supabase.from("users").select().limit(1);
    if (error) {
      console.error("Supabase connection failed:", error.message);
    } else {
      console.log("Supabase is connected!");
    }
  } catch (err) {
    console.error("Supabase connection error:", err);
  }
}

// Test Localhost (Express) connection
export function testLocalhostConnection(port: number) {
  console.log(`Server is running on http://localhost:${port}`);
}
