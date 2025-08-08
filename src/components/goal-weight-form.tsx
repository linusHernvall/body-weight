"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { use_update_goal_weight } from "@/hooks/use-weights";
import { Target } from "lucide-react";

const goal_weight_schema = z.object({
  goal_weight: z
    .number()
    .min(20, "Goal weight must be at least 20kg")
    .max(500, "Goal weight must be less than 500kg"),
});

type GoalWeightFormData = z.infer<typeof goal_weight_schema>;

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

  const form = useForm<GoalWeightFormData>({
    resolver: zodResolver(goal_weight_schema),
    defaultValues: {
      goal_weight: current_goal_weight || 0,
    },
  });

  const onSubmit = async (data: GoalWeightFormData) => {
    try {
      await update_goal_weight_mutation.mutateAsync(data.goal_weight);
      setIs_editing(false);
      on_success?.();
    } catch (error) {
      console.error("Error updating goal weight:", error);
    }
  };

  const handle_edit = () => {
    setIs_editing(true);
    form.setValue("goal_weight", current_goal_weight || 0);
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
            <div className="text-2xl font-bold">{current_goal_weight} kg</div>
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
            <Label htmlFor="goal_weight">Goal Weight (kg)</Label>
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
