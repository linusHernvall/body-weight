"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  use_add_weight,
  use_update_weight,
  use_weights,
} from "@/hooks/use-weights";
import { Weight } from "@/types";
import { format_date } from "@/lib/utils";
import { useUnits } from "@/contexts/units-context";

const create_weight_schema = (unit: "kg" | "lbs") =>
  z.object({
    date: z.string().min(1, "Date is required"),
    value: z
      .number()
      .min(
        unit === "kg" ? 20 : 44,
        `Weight must be at least ${unit === "kg" ? "20kg" : "44lbs"}`
      )
      .max(
        unit === "kg" ? 500 : 1100,
        `Weight must be less than ${unit === "kg" ? "500kg" : "1100lbs"}`
      ),
  });

type WeightFormData = z.infer<ReturnType<typeof create_weight_schema>>;

interface WeightFormProps {
  selected_date?: string;
  existing_weight?: Weight | null;
  on_success?: () => void;
}

export function WeightForm({
  selected_date,
  existing_weight,
  on_success,
}: WeightFormProps) {
  const [is_editing, setIs_editing] = useState(false);
  const [show_replace_dialog, setShow_replace_dialog] = useState(false);
  const [conflicting_weight, setConflicting_weight] = useState<Weight | null>(
    null
  );
  const [pending_form_data, setPending_form_data] =
    useState<WeightFormData | null>(null);

  const add_weight_mutation = use_add_weight();
  const update_weight_mutation = use_update_weight();
  const { data: all_weights } = use_weights();
  const { unit, convert_to_display, convert_to_storage, format_weight } =
    useUnits();

  // Create schema that updates when unit changes
  const schema = useMemo(() => create_weight_schema(unit), [unit]);

  const form = useForm<WeightFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: selected_date || new Date().toISOString().split("T")[0],
      value: existing_weight ? convert_to_display(existing_weight.value) : 0,
    },
  });

  // Update form resolver when unit changes
  useEffect(() => {
    form.clearErrors();
  }, [unit, form]);

  const find_existing_weight_for_date = (date: string): Weight | null => {
    return all_weights?.find((weight) => weight.date === date) || null;
  };

  const onSubmit = async (data: WeightFormData) => {
    try {
      if (existing_weight && is_editing) {
        await update_weight_mutation.mutateAsync({
          id: existing_weight.id,
          value: convert_to_storage(data.value),
        });
        form.reset();
        on_success?.();
      } else {
        // Check if there's already a weight for this date
        const existing_weight_for_date = find_existing_weight_for_date(
          data.date
        );

        if (existing_weight_for_date) {
          // Show confirmation dialog
          setConflicting_weight(existing_weight_for_date);
          setPending_form_data(data);
          setShow_replace_dialog(true);
          return;
        }

        // No conflict, add the weight
        await add_weight_mutation.mutateAsync({
          date: data.date,
          value: convert_to_storage(data.value),
        });
        form.reset();
        on_success?.();
      }
    } catch (error) {
      console.error("Error saving weight:", error);
    }
  };

  const handle_replace_weight = async () => {
    if (!pending_form_data || !conflicting_weight) return;

    try {
      // Update the existing weight instead of creating a new one
      await update_weight_mutation.mutateAsync({
        id: conflicting_weight.id,
        value: convert_to_storage(pending_form_data.value),
      });

      form.reset();
      setShow_replace_dialog(false);
      setConflicting_weight(null);
      setPending_form_data(null);
      on_success?.();
    } catch (error) {
      console.error("Error replacing weight:", error);
    }
  };

  const handle_cancel_replace = () => {
    setShow_replace_dialog(false);
    setConflicting_weight(null);
    setPending_form_data(null);
  };

  const handle_edit = () => {
    setIs_editing(true);
    form.setValue(
      "value",
      existing_weight ? convert_to_display(existing_weight.value) : 0
    );
  };

  const handle_cancel = () => {
    setIs_editing(false);
    form.reset();
  };

  if (existing_weight && !is_editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight for {format_date(existing_weight.date)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {format_weight(convert_to_display(existing_weight.value))}
            </div>
            <Button onClick={handle_edit} variant="outline" size="sm">
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existing_weight && is_editing
            ? `Edit Weight for ${format_date(existing_weight.date)}`
            : "Record Today's Weight"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...form.register("date")}
              disabled={!!existing_weight && is_editing}
              max={new Date().toISOString().split("T")[0]}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Weight ({unit})</Label>
            <Input
              id="value"
              type="number"
              step="0.1"
              {...form.register("value", { valueAsNumber: true })}
            />
            {form.formState.errors.value && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.value.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={
                add_weight_mutation.isPending ||
                update_weight_mutation.isPending
              }
            >
              {add_weight_mutation.isPending || update_weight_mutation.isPending
                ? "Saving..."
                : existing_weight && is_editing
                ? "Update Weight"
                : "Save Weight"}
            </Button>
            {existing_weight && is_editing && (
              <Button type="button" variant="outline" onClick={handle_cancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>

      {/* Replace Weight Confirmation Dialog */}
      <Dialog open={show_replace_dialog} onOpenChange={setShow_replace_dialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weight Already Exists</DialogTitle>
            <DialogDescription>
              You already have a weight entry of{" "}
              <span className="font-semibold">
                {conflicting_weight
                  ? format_weight(convert_to_display(conflicting_weight.value))
                  : ""}
              </span>{" "}
              for{" "}
              {conflicting_weight ? format_date(conflicting_weight.date) : ""}.
              <br />
              <br />
              Do you want to replace it with the new value of{" "}
              <span className="font-semibold">
                {pending_form_data
                  ? format_weight(pending_form_data.value)
                  : ""}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handle_cancel_replace}>
              Cancel
            </Button>
            <Button
              onClick={handle_replace_weight}
              disabled={update_weight_mutation.isPending}
            >
              {update_weight_mutation.isPending
                ? "Replacing..."
                : "Replace Weight"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
