import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, auth_api } from "@/lib/supabase";

export function useAuth() {
  const [user, set_user] = useState<User | null>(null);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    // Get initial session
    const get_session = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set_user(session?.user ?? null);
      set_loading(false);
    };

    get_session();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      set_user(session?.user ?? null);
      set_loading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sign_up = async (email: string, password: string) => {
    return auth_api.sign_up(email, password);
  };

  const sign_in = async (email: string, password: string) => {
    return auth_api.sign_in(email, password);
  };

  const reset_password = async (email: string) => {
    return auth_api.reset_password(email);
  };

  const sign_out = async () => {
    return auth_api.sign_out();
  };

  const delete_account = async () => {
    return auth_api.delete_user();
  };

  return {
    user,
    loading,
    sign_up,
    sign_in,
    reset_password,
    sign_out,
    delete_account,
  };
}
