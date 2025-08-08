import { supabase } from "./supabase";

export async function testSupabaseConnection() {
  try {
    console.log("🔍 Testing Supabase connection...");

    // Test basic connection
    const { data, error } = await supabase
      .from("user_profiles")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ Database connection error:", error);
      return false;
    }

    console.log("✅ Database connection successful");
    return true;
  } catch (err) {
    console.error("❌ Connection test failed:", err);
    return false;
  }
}
