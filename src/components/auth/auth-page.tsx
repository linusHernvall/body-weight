"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

export function AuthPage() {
  const [is_login, setIs_login] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            MassLog
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your weight progress with charts and insights
          </p>
        </div>

        {is_login ? (
          <LoginForm on_switch_to_signup={() => setIs_login(false)} />
        ) : (
          <SignupForm on_switch_to_login={() => setIs_login(true)} />
        )}
      </div>
    </div>
  );
}
