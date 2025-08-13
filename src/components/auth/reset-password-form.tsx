"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const new_password_schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type NewPasswordFormData = z.infer<typeof new_password_schema>;

export function ResetPasswordForm() {
  const [error, set_error] = useState<string | null>(null);
  const [success, set_success] = useState(false);
  const [loading, set_loading] = useState(true);
  const [has_session, set_has_session] = useState(false);
  const router = useRouter();
  const search_params = useSearchParams();

  const form = useForm<NewPasswordFormData>({
    resolver: zodResolver(new_password_schema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    // Handle the password reset flow
    const handle_reset = async () => {
      try {
        // Get URL parameters that Supabase might have added
        const access_token = search_params.get("access_token");
        const refresh_token = search_params.get("refresh_token");
        const type = search_params.get("type");

        // If we have tokens in the URL, set the session
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            console.error("Error setting session:", error);
            set_error(
              "Invalid or expired reset link. Please request a new one."
            );
            set_loading(false);
            return;
          }
        }

        // Check if we have a valid session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          set_has_session(true);
        } else {
          // If no session, check if we're in a recovery flow
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            set_has_session(true);
          } else {
            set_error(
              "Invalid or expired reset link. Please request a new one."
            );
          }
        }
      } catch (error) {
        console.error("Error in reset flow:", error);
        set_error("Invalid or expired reset link. Please request a new one.");
      } finally {
        set_loading(false);
      }
    };

    handle_reset();
  }, [search_params]);

  const onSubmit = async (data: NewPasswordFormData) => {
    set_error(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      set_success(true);
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: any) {
      set_error(error.message || "Failed to update password");
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error && !success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-red-600">
            Reset Failed
          </CardTitle>
          <p className="text-center text-muted-foreground">{error}</p>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/auth")} className="w-full">
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-green-600">
            Password Updated!
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Your password has been successfully updated. Redirecting to
            dashboard...
          </p>
        </CardHeader>
        <CardContent className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </CardContent>
      </Card>
    );
  }

  if (!has_session) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-red-600">
            Invalid Reset Link
          </CardTitle>
          <p className="text-center text-muted-foreground">
            This reset link is invalid or has expired. Please request a new one.
          </p>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/auth")} className="w-full">
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Set new password</CardTitle>
        <p className="text-center text-muted-foreground">
          Enter your new password below.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                className="pl-10"
                {...form.register("password")}
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm_password"
                type="password"
                placeholder="Confirm new password"
                className="pl-10"
                {...form.register("confirm_password")}
              />
            </div>
            {form.formState.errors.confirm_password && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.confirm_password.message}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
