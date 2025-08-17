"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Weight } from "@/types";
import {
  calculate_weekly_averages,
  format_date,
  format_week_range,
  format_weight_value,
  is_current_week,
  is_previous_week,
} from "@/lib/utils";
import { use_update_weight, use_delete_weight } from "@/hooks/use-weights";
import { Edit2, Trash2, Check, X } from "lucide-react";

interface WeeklyWeightListProps {
  weights: Weight[];
  goal_weight: number | null;
}

export function WeeklyWeightList({
  weights,
  goal_weight,
}: WeeklyWeightListProps) {
  const [editing_id, set_editing_id] = useState<string | null>(null);
  const [edit_value, set_edit_value] = useState<number>(0);
  const [expanded_weeks, set_expanded_weeks] = useState<string[]>([]);
  const update_weight_mutation = use_update_weight();
  const delete_weight_mutation = use_delete_weight();

  const weekly_averages = calculate_weekly_averages(weights);

  // Initialize expanded state - current week should be expanded by default
  useEffect(() => {
    if (weekly_averages.length > 0 && expanded_weeks.length === 0) {
      const current_week = weekly_averages.find((week) =>
        is_current_week(week.week_start)
      );
      if (current_week) {
        set_expanded_weeks([current_week.week_start]);
      }
    }
  }, [weekly_averages.length]);

  const toggle_week_expansion = (week_start: string) => {
    set_expanded_weeks((prev) => {
      if (prev.includes(week_start)) {
        return prev.filter((week) => week !== week_start);
      } else {
        return [...prev, week_start];
      }
    });
  };

  const is_week_expanded = (week_start: string) => {
    return expanded_weeks.includes(week_start);
  };

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
        // Silently handle weight update error
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
        // Silently handle weight deletion error
      }
    }
  };

  const get_week_header_text = (week_start: string): string => {
    if (is_current_week(week_start)) {
      return "This week";
    } else if (is_previous_week(week_start)) {
      return "Last week";
    } else {
      const week_end =
        weekly_averages.find((w) => w.week_start === week_start)?.week_end ||
        "";
      return format_week_range(week_start, week_end);
    }
  };

  const get_week_subtitle = (week_start: string): string => {
    const start_date = new Date(week_start);
    const end_date = new Date(
      weekly_averages.find((w) => w.week_start === week_start)?.week_end || ""
    );

    if (is_current_week(week_start)) {
      return `${start_date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${end_date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    } else if (is_previous_week(week_start)) {
      return `${start_date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${end_date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    } else {
      return `${start_date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} - ${end_date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
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
        <div className="space-y-4">
          {weekly_averages.map((week) => (
            <div key={week.week_start} className="space-y-2">
              {/* Clickable Week Header with Average */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggle_week_expansion(week.week_start);
                  (e.currentTarget as HTMLButtonElement).blur();
                }}
                className={`dropdown-button  w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 focus:outline-none ${
                  is_week_expanded(week.week_start)
                    ? "expanded border-blue-200 dark:border-blue-800 "
                    : "border-blue-200 dark:border-blue-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      rotate: is_week_expanded(week.week_start) ? 180 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </motion.div>

                  <div>
                    <div className="font-semibold text-blue-800 dark:text-blue-200 text-left">
                      {get_week_header_text(week.week_start)}
                    </div>
                    <div className="text-xs text-blue-800 dark:text-blue-400 text-left">
                      {get_week_subtitle(week.week_start)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                    {week.average} kg
                  </div>
                  <div className="text-xs text-blue-800 dark:text-blue-400">
                    average ({week.count} entries)
                  </div>
                </div>
              </button>

              {/* Collapsible Daily Entries for the Week */}
              <AnimatePresence>
                {is_week_expanded(week.week_start) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 ml-4 pt-2">
                      {week.weights.map((weight) => (
                        <motion.div
                          key={weight.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
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
                                    set_edit_value(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">
                                  kg
                                </span>
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
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
