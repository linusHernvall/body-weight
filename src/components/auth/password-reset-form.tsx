"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Mail, Loader2, ArrowLeft } from "lucide-react";

const reset_schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetFormData = z.infer<typeof reset_schema>;

interface PasswordResetFormProps {
  on_back_to_login: () => void;
}

export function PasswordResetForm({
  on_back_to_login,
}: PasswordResetFormProps) {
  const [error, set_error] = useState<string | null>(null);
  const [success, set_success] = useState(false);
  const { reset_password } = useAuth();

  const form = useForm<ResetFormData>({
    resolver: zodResolver(reset_schema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetFormData) => {
    set_error(null);
    set_success(false);
    try {
      await reset_password(data.email);
      set_success(true);
    } catch (error: any) {
      set_error(error.message || "Failed to send reset email");
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Check your email
          </CardTitle>
          <p className="text-center text-muted-foreground">
            We've sent a password reset link to your email address.
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  set_success(false);
                  form.reset();
                }}
                className="flex-1"
              >
                Try again
              </Button>
              <Button
                variant="outline"
                onClick={on_back_to_login}
                className="flex-1"
              >
                Back to sign in
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Reset password</CardTitle>
        <p className="text-center text-muted-foreground">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.email.message}
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
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={on_back_to_login}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
