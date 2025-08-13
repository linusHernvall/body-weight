"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  Settings,
  User,
  Lock,
  Trash2,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export function SettingsMenu() {
  const { user, sign_out, delete_account } = useAuth();
  const [is_open, setIs_open] = useState(false);
  const [active_section, set_active_section] = useState<
    "main" | "change_password" | "delete_account"
  >("main");

  // Change password state
  const [current_password, set_current_password] = useState("");
  const [new_password, set_new_password] = useState("");
  const [confirm_password, set_confirm_password] = useState("");
  const [is_changing_password, setIs_changing_password] = useState(false);
  const [password_error, set_password_error] = useState("");

  // Delete account state
  const [confirmation, set_confirmation] = useState("");
  const [is_deleting, setIs_deleting] = useState(false);

  const handle_change_password = async () => {
    if (new_password !== confirm_password) {
      set_password_error("New passwords do not match.");
      return;
    }

    if (new_password.length < 6) {
      set_password_error("Password must be at least 6 characters long.");
      return;
    }

    setIs_changing_password(true);
    set_password_error("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: new_password,
      });

      if (error) {
        set_password_error(error.message);
      } else {
        // Reset form and go back to main menu
        set_current_password("");
        set_new_password("");
        set_confirm_password("");
        set_active_section("main");
      }
    } catch (error) {
      set_password_error("Failed to change password. Please try again.");
    } finally {
      setIs_changing_password(false);
    }
  };

  const handle_delete_account = async () => {
    if (confirmation !== "DELETE") {
      return;
    }

    setIs_deleting(true);
    try {
      await delete_account();
      setIs_open(false);
    } catch (error) {
      alert("Failed to delete account. Please try again.");
    } finally {
      setIs_deleting(false);
    }
  };

  const handle_sign_out = async () => {
    try {
      await sign_out();
    } catch (error) {
      // Silently handle sign out error
    }
  };

  const render_main_section = () => (
    <div className="space-y-6">
      {/* User Info */}
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
        <User className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">{user?.email}</p>
          <p className="text-sm text-muted-foreground">Account Settings</p>
        </div>
      </div>

      {/* Settings Options */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => set_active_section("change_password")}
        >
          <Lock className="h-4 w-4 mr-2" />
          Change Password
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handle_sign_out}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>

        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={() => set_active_section("delete_account")}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account & Data
        </Button>
      </div>
    </div>
  );

  const render_change_password_section = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-password">New Password</Label>
        <Input
          id="new-password"
          type="password"
          value={new_password}
          onChange={(e) => set_new_password(e.target.value)}
          placeholder="Enter new password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm New Password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirm_password}
          onChange={(e) => set_confirm_password(e.target.value)}
          placeholder="Confirm new password"
        />
      </div>

      {password_error && (
        <p className="text-sm text-destructive">{password_error}</p>
      )}

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            set_active_section("main");
            set_new_password("");
            set_confirm_password("");
            set_password_error("");
          }}
          disabled={is_changing_password}
        >
          Cancel
        </Button>
        <Button
          onClick={handle_change_password}
          disabled={!new_password || !confirm_password || is_changing_password}
        >
          {is_changing_password ? "Changing..." : "Change Password"}
        </Button>
      </DialogFooter>
    </div>
  );

  const render_delete_account_section = () => (
    <div className="space-y-4">
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-sm text-destructive">
          <strong>Warning:</strong> All your weight data and goal settings will
          be permanently deleted. You will be signed out and your account will
          be permanently deleted. This action cannot be undone.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmation">Type "DELETE" to confirm</Label>
        <Input
          id="confirmation"
          value={confirmation}
          onChange={(e) => set_confirmation(e.target.value)}
          placeholder="DELETE"
        />
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            set_active_section("main");
            set_confirmation("");
          }}
          disabled={is_deleting}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handle_delete_account}
          disabled={confirmation !== "DELETE" || is_deleting}
        >
          {is_deleting ? "Deleting..." : "Delete Account"}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <Dialog open={is_open} onOpenChange={setIs_open}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {active_section === "main" && "Settings"}
            {active_section === "change_password" && "Change Password"}
            {active_section === "delete_account" && (
              <>
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Account
              </>
            )}
          </DialogTitle>
          {active_section === "main" && (
            <DialogDescription>
              Manage your account settings and preferences.
            </DialogDescription>
          )}
          {active_section === "change_password" && (
            <DialogDescription>
              Enter your new password below:
            </DialogDescription>
          )}
          {active_section === "delete_account" && (
            <DialogDescription>
              This action cannot be undone. This will permanently delete all
              your weight data and your account. You will be signed out and will
              not be able to log in again.
            </DialogDescription>
          )}
        </DialogHeader>

        {active_section === "main" && render_main_section()}
        {active_section === "change_password" &&
          render_change_password_section()}
        {active_section === "delete_account" && render_delete_account_section()}
      </DialogContent>
    </Dialog>
  );
}
