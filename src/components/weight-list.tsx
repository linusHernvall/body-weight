"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Weight } from "@/types";
import { format_date, format_weight_value } from "@/lib/utils";
import { use_update_weight, use_delete_weight } from "@/hooks/use-weights";
import { Edit2, Trash2, Check, X } from "lucide-react";

interface WeightListProps {
  weights: Weight[];
  goal_weight: number | null;
}

export function WeightList({ weights, goal_weight }: WeightListProps) {
  const [editing_id, set_editing_id] = useState<string | null>(null);
  const [edit_value, set_edit_value] = useState<number>(0);

  const update_weight_mutation = use_update_weight();
  const delete_weight_mutation = use_delete_weight();

  const handle_edit = (weight: Weight) => {
    set_editing_id(weight.id);
    set_edit_value(weight.value);
  };

  const handle_save = async () => {
    if (editing_id) {
      try {
        await update_weight_mutation.mutateAsync({
          id: editing_id,
          value: edit_value,
        });
        set_editing_id(null);
      } catch (error) {
        console.error("Error updating weight:", error);
      }
    }
  };

  const handle_cancel = () => {
    set_editing_id(null);
  };

  const handle_delete = async (id: string) => {
    if (confirm("Are you sure you want to delete this weight entry?")) {
      try {
        await delete_weight_mutation.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting weight:", error);
      }
    }
  };

  if (weights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <div className="text-3xl mb-2">📝</div>
              <p>No weight entries yet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {weights
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((weight) => (
              <div
                key={weight.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {format_date(weight.date)}
                  </div>
                  {editing_id === weight.id ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        step="0.1"
                        value={edit_value}
                        onChange={(e) =>
                          set_edit_value(parseFloat(e.target.value) || 0)
                        }
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">kg</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-primary">
                      {format_weight_value(weight.value)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editing_id === weight.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={handle_save}
                        disabled={update_weight_mutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handle_cancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handle_edit(weight)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handle_delete(weight.id)}
                        disabled={delete_weight_mutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
