"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { PasswordResetForm } from "./password-reset-form";
import Image from "next/image";
import { useTheme } from "next-themes";

type AuthState = "login" | "signup" | "reset";

export function AuthPage() {
  const [auth_state, set_auth_state] = useState<AuthState>("login");
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {mounted && (
              <Image
                key={theme}
                src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
                alt="MassLog Logo"
                width={200}
                height={80}
                className="w-50 h-20"
                priority
              />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to MassLog!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your weight progress with charts and insights.
          </p>
        </div>

        {auth_state === "login" && (
          <LoginForm
            on_switch_to_signup={() => set_auth_state("signup")}
            on_switch_to_reset={() => set_auth_state("reset")}
          />
        )}
        {auth_state === "signup" && (
          <SignupForm on_switch_to_login={() => set_auth_state("login")} />
        )}
        {auth_state === "reset" && (
          <PasswordResetForm on_back_to_login={() => set_auth_state("login")} />
        )}
      </div>
    </div>
  );
}
