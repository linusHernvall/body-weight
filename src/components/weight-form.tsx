"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  use_add_weight,
  use_update_weight,
  use_weight_by_date,
} from "@/hooks/use-weights";
import { Weight } from "@/types";
import { format_date, format_weight_value } from "@/lib/utils";

const weight_schema = z.object({
  date: z.string().min(1, "Date is required"),
  value: z
    .number()
    .min(20, "Weight must be at least 20kg")
    .max(500, "Weight must be less than 500kg"),
});

type WeightFormData = z.infer<typeof weight_schema>;

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

  const add_weight_mutation = use_add_weight();
  const update_weight_mutation = use_update_weight();

  const form = useForm<WeightFormData>({
    resolver: zodResolver(weight_schema),
    defaultValues: {
      date: selected_date || new Date().toISOString().split("T")[0],
      value: existing_weight?.value || 0,
    },
  });

  const onSubmit = async (data: WeightFormData) => {
    try {
      if (existing_weight && is_editing) {
        await update_weight_mutation.mutateAsync({
          id: existing_weight.id,
          value: data.value,
        });
      } else {
        await add_weight_mutation.mutateAsync({
          date: data.date,
          value: data.value,
        });
      }
      form.reset();
      on_success?.();
    } catch (error) {
      console.error("Error saving weight:", error);
    }
  };

  const handle_edit = () => {
    setIs_editing(true);
    form.setValue("value", existing_weight?.value || 0);
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
              {format_weight_value(existing_weight.value)}
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
              disabled={!!existing_weight}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Weight (kg)</Label>
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
    </Card>
  );
}
