import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Create the Supabase client
const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase_anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are available
if (!supabase_url || !supabase_anon_key) {
  console.error("Missing Supabase environment variables:", {
    url: supabase_url ? "Set" : "Missing",
    key: supabase_anon_key ? "Set" : "Missing",
  });
}

// Create the Supabase client instance
export const supabase = createClient<Database>(
  supabase_url || "https://dummy.supabase.co",
  supabase_anon_key || "dummy-key"
);

// Database helper functions
export const weights_api = {
  // Get all weights for a user
  async get_weights(user_id: string) {
    const { data, error } = await supabase
      .from("weights")
      .select("*")
      .eq("user_id", user_id)
      .order("date", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Add a new weight entry
  async add_weight(user_id: string, date: string, value: number) {
    const { data, error } = await supabase
      .from("weights")
      .insert({ user_id, date, value })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an existing weight entry
  async update_weight(id: string, value: number) {
    const { data, error } = await supabase
      .from("weights")
      .update({ value })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a weight entry
  async delete_weight(id: string) {
    const { error } = await supabase.from("weights").delete().eq("id", id);

    if (error) throw error;
  },

  // Get weight for a specific date
  async get_weight_by_date(user_id: string, date: string) {
    const { data, error } = await supabase
      .from("weights")
      .select("*")
      .eq("user_id", user_id)
      .eq("date", date)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },
};

export const user_profiles_api = {
  // Get user profile
  async get_profile(user_id: string) {
    console.log("🔍 Fetching user profile for:", user_id);

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user_id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("❌ Error fetching user profile:", error);
      throw error;
    }

    console.log("✅ User profile fetched:", data);
    return data;
  },

  // Create or update user profile
  async upsert_profile(user_id: string, goal_weight: number | null) {
    console.log("📝 Upserting user profile:", { user_id, goal_weight });

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({ id: user_id, goal_weight })
      .select()
      .single();

    if (error) {
      console.error("❌ Error upserting user profile:", error);
      throw error;
    }

    console.log("✅ User profile upserted successfully:", data);
    return data;
  },

  // Delete user profile
  async delete_profile(user_id: string) {
    const { error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", user_id);

    if (error) throw error;
  },
};

export const auth_api = {
  // Sign up with email and password
  async sign_up(email: string, password: string) {
    console.log("🚀 Starting user signup process...");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("❌ Signup error:", error);
      throw error;
    }

    console.log("✅ User created successfully:", data.user?.id);
    console.log(
      "📝 User profile will be created automatically by database trigger"
    );

    // User profile will be created automatically by the database trigger
    // No need to manually create it here to avoid race conditions

    return data;
  },

  // Sign in with email and password
  async sign_in(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Reset password
  async reset_password(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?type=recovery`,
    });

    if (error) throw error;
  },

  // Sign out
  async sign_out() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Delete user account
  async delete_user() {
    const { error } = await supabase.auth.admin.deleteUser(
      (
        await supabase.auth.getUser()
      ).data.user?.id!
    );
    if (error) throw error;
  },
};
