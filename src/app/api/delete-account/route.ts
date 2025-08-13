import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request body
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Create Supabase client with service role for admin operations
    const cookieStore = cookies();
    const supabase_admin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Delete user's weights
    const { error: weights_error } = await supabase_admin
      .from("weights")
      .delete()
      .eq("user_id", user_id);

    if (weights_error) {
      // Silently handle weights deletion error
    }

    // Delete user's profile
    const { error: profile_error } = await supabase_admin
      .from("user_profiles")
      .delete()
      .eq("id", user_id);

    if (profile_error) {
      // Silently handle profile deletion error
    }

    // Delete the user account using admin privileges
    const { error: delete_error } = await supabase_admin.auth.admin.deleteUser(
      user_id
    );

    if (delete_error) {
      return NextResponse.json(
        { error: "Failed to delete user account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
