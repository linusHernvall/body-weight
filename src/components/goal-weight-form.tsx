"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { use_update_goal_weight } from "@/hooks/use-weights";
import { useUnits } from "@/contexts/units-context";
import { Target } from "lucide-react";

const create_goal_weight_schema = (unit: "kg" | "lbs") =>
  z.object({
    goal_weight: z
      .number()
      .min(
        unit === "kg" ? 20 : 44,
        `Goal weight must be at least ${unit === "kg" ? "20kg" : "44lbs"}`
      )
      .max(
        unit === "kg" ? 500 : 1100,
        `Goal weight must be less than ${unit === "kg" ? "500kg" : "1100lbs"}`
      ),
  });

type GoalWeightFormData = z.infer<ReturnType<typeof create_goal_weight_schema>>;

interface GoalWeightFormProps {
  current_goal_weight: number | null;
  on_success?: () => void;
}

export function GoalWeightForm({
  current_goal_weight,
  on_success,
}: GoalWeightFormProps) {
  const [is_editing, setIs_editing] = useState(false);

  const update_goal_weight_mutation = use_update_goal_weight();
  const { unit, convert_to_display, convert_to_storage, format_weight } =
    useUnits();

  // Create schema that updates when unit changes
  const schema = useMemo(() => create_goal_weight_schema(unit), [unit]);

  const form = useForm<GoalWeightFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      goal_weight: current_goal_weight
        ? convert_to_display(current_goal_weight)
        : 0,
    },
  });

  // Update form resolver when unit changes
  useEffect(() => {
    form.clearErrors();
  }, [unit, form]);

  const onSubmit = async (data: GoalWeightFormData) => {
    try {
      await update_goal_weight_mutation.mutateAsync(
        convert_to_storage(data.goal_weight)
      );
      setIs_editing(false);
      on_success?.();
    } catch (error) {
      // Silently handle goal weight update error
    }
  };

  const handle_edit = () => {
    setIs_editing(true);
    form.setValue(
      "goal_weight",
      current_goal_weight ? convert_to_display(current_goal_weight) : 0
    );
  };

  const handle_cancel = () => {
    setIs_editing(false);
    form.reset();
  };

  if (current_goal_weight && !is_editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal Weight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {format_weight(convert_to_display(current_goal_weight))}
            </div>
            <Button onClick={handle_edit} variant="outline" size="sm">
              Edit Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {current_goal_weight ? "Edit Goal Weight" : "Set Goal Weight"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal_weight">Goal Weight ({unit})</Label>
            <Input
              id="goal_weight"
              type="number"
              step="0.1"
              {...form.register("goal_weight", { valueAsNumber: true })}
            />
            {form.formState.errors.goal_weight && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.goal_weight.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={update_goal_weight_mutation.isPending}
            >
              {update_goal_weight_mutation.isPending
                ? "Saving..."
                : current_goal_weight
                ? "Update Goal"
                : "Set Goal"}
            </Button>
            {current_goal_weight && (
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
