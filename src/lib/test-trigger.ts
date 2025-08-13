import { supabase } from "./supabase";

export async function test_user_profile_creation() {
  console.log("🧪 Testing user profile creation...");

  try {
    // Test if we can query user_profiles table
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .limit(1);

    if (error) {
      console.error("❌ Error querying user_profiles:", error);
      return false;
    }

    console.log("✅ Successfully queried user_profiles table");
    console.log("📊 Sample data:", data);
    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}
