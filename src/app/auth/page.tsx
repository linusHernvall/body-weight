"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthPage } from "@/components/auth/auth-page";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import Image from "next/image";

export default function AuthPageRoute() {
  const search_params = useSearchParams();
  const [is_reset_mode, setIs_reset_mode] = useState(false);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    // Check if we're in reset mode (user clicked email link)
    const reset_param = search_params.get("reset");
    const access_token = search_params.get("access_token");
    const refresh_token = search_params.get("refresh_token");
    const type = search_params.get("type");
    const error = search_params.get("error");
    const error_description = search_params.get("error_description");

    // Check for Supabase password recovery flow
    if (
      reset_param === "true" ||
      access_token ||
      refresh_token ||
      type === "recovery" ||
      (error && error_description)
    ) {
      setIs_reset_mode(true);
    }
    set_loading(false);
  }, [search_params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (is_reset_mode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo-dark.png"
                alt="MassLog Logo"
                width={120}
                height={60}
                className="dark:hidden"
              />
              <Image
                src="/logo-light.png"
                alt="MassLog Logo"
                width={120}
                height={60}
                className="hidden dark:block"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set a new password for your MassLog account
            </p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    );
  }

  return <AuthPage />;
}
