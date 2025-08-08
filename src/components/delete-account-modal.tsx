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
import { Trash2, AlertTriangle } from "lucide-react";

export function DeleteAccountModal() {
  const [is_open, setIs_open] = useState(false);
  const [confirmation, set_confirmation] = useState("");
  const [is_deleting, setIs_deleting] = useState(false);

  const { delete_account } = useAuth();

  const handle_delete = async () => {
    if (confirmation !== "DELETE") {
      return;
    }

    setIs_deleting(true);
    try {
      await delete_account();
      setIs_open(false);
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIs_deleting(false);
    }
  };

  return (
    <Dialog open={is_open} onOpenChange={setIs_open}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove all your weight data from our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              <strong>Warning:</strong> All your weight data, goal settings, and
              account information will be permanently deleted.
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIs_open(false)}
            disabled={is_deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handle_delete}
            disabled={confirmation !== "DELETE" || is_deleting}
          >
            {is_deleting ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
