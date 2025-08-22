"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { use_weights, use_user_profile } from "@/hooks/use-weights";
import { useTheme } from "next-themes";

import { DashboardCard } from "@/components/dashboard-card";
import { WeightForm } from "@/components/weight-form";
import { WeightChart } from "@/components/weight-chart";
import { WeeklyWeightList } from "@/components/weekly-weight-list";
import { GoalWeightForm } from "@/components/goal-weight-form";
import { SettingsMenu } from "@/components/settings-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { UnitToggle } from "@/components/unit-toggle";
import {
  calculate_dashboard_stats,
  format_date_whole_month,
} from "@/lib/utils";
import { useUnits } from "@/contexts/units-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { use_update_total_change_start_date } from "@/hooks/use-weights";
import { Weight } from "@/types";
import Image from "next/image";

// Starting Date Form Component
function StartingDateForm({
  current_start_date,
  weights,
  on_success,
}: {
  current_start_date: string | null;
  weights: Weight[];
  on_success: () => void;
}) {
  const [selected_date, set_selected_date] = useState(current_start_date || "");
  const update_start_date_mutation = use_update_total_change_start_date();

  // Get available dates from weights for the date picker
  const available_dates = weights
    .map((w) => w.date)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const handle_save = async () => {
    try {
      await update_start_date_mutation.mutateAsync(selected_date || null);
      on_success();
    } catch (error) {
      console.error("Failed to update total change start date:", error);
    }
  };

  // const handle_reset = async () => {
  //   try {
  //     await update_start_date_mutation.mutateAsync(null);
  //     on_success();
  //   } catch (error) {
  //     console.error("Failed to reset total change start date:", error);
  //   }
  // };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="start_date">Select starting date:</Label>
        <Input
          id="start_date"
          type="date"
          value={selected_date}
          onChange={(e) => set_selected_date(e.target.value)}
          min={available_dates[0]}
          max={available_dates[available_dates.length - 1]}
        />
        <p className="text-xs text-muted-foreground">
          Choose a date from your weight history to use as the starting point
          for total change calculations.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handle_save}
          disabled={update_start_date_mutation.isPending}
          className="flex-1"
        >
          {update_start_date_mutation.isPending ? "Saving..." : "Save"}
        </Button>
        {/* {current_start_date && (
          <Button
            type="button"
            variant="outline"
            onClick={handle_reset}
            disabled={update_start_date_mutation.isPending}
            className="flex-1"
          >
            Reset to First Weight
          </Button>
        )} */}
      </div>
    </div>
  );
}

// Helper function to find weight for a specific date
function get_weight_for_date(weights: Weight[], date: string): Weight | null {
  return weights.find((w) => w.date === date) || null;
}

export function Dashboard() {
  const { data: weights = [], isLoading: weights_loading } = use_weights();
  const { data: user_profile, isLoading: profile_loading } = use_user_profile();
  const { theme } = useTheme();
  const { unit, format_weight, convert_to_display } = useUnits();
  const [mounted, setMounted] = useState(false);
  const [selected_date, set_selected_date] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [show_start_date_modal, set_show_start_date_modal] = useState(false);

  const stats = calculate_dashboard_stats(
    weights,
    user_profile?.goal_weight || null,
    user_profile?.total_change_start_date || null
  );
  const today_weight = weights.find((w) => w.date === selected_date);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (weights_loading || profile_loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {mounted && (
                <Image
                  key={theme}
                  src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
                  alt="MassLog Logo"
                  width={160}
                  height={64}
                  className="w-40 h-16 md:w-60 md:h-24"
                  priority
                />
              )}
            </div>
            <div className="flex items-center">
              <UnitToggle />
              <ThemeToggle />
              <SettingsMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to MassLog!</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Track your weight progress with charts and insights. Keep track of
            your weight, set goals and see your progress over time.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Left Column - Forms and Stats */}
          <div className="lg:col-span-1 space-y-4 lg:space-y-6">
            {/* Weight Form */}
            <WeightForm
              key={`weight-form-${unit}`}
              selected_date={selected_date}
              existing_weight={today_weight}
            />

            {/* Goal Weight Form */}
            <GoalWeightForm
              key={`goal-form-${unit}`}
              current_goal_weight={user_profile?.goal_weight || null}
            />

            {/* Dashboard Stats */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Stats</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <DashboardCard
                  title="Current Weight"
                  value={stats.current_weight}
                />
                <DashboardCard
                  title="Weekly Change (average)"
                  value={stats.weight_change_week}
                  change={stats.weight_change_week}
                />
                {/* Custom Total Change Card with Starting Point Controls */}
                <Card className="transition-all duration-200 hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Change
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-2xl font-bold">
                      {stats.total_change !== null &&
                      stats.total_change !== undefined
                        ? `${
                            stats.total_change > 0
                              ? "+ "
                              : stats.total_change < 0
                              ? "- "
                              : ""
                          }${format_weight(
                            Math.abs(convert_to_display(stats.total_change))
                          )}`
                        : "No data"}
                    </div>

                    {/* Starting Point Display */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Starting point:</span>
                      <span>
                        {user_profile?.total_change_start_date
                          ? (() => {
                              const start_weight = get_weight_for_date(
                                weights,
                                user_profile.total_change_start_date
                              );
                              return `${format_date_whole_month(
                                user_profile.total_change_start_date
                              )} (${
                                start_weight
                                  ? format_weight(
                                      convert_to_display(start_weight.value)
                                    )
                                  : "No weight recorded"
                              })`;
                            })()
                          : "First recorded weight"}
                      </span>
                    </div>

                    {/* Change Starting Point Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => set_show_start_date_modal(true)}
                      className="w-full text-xs"
                    >
                      Change Starting Point
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right Column - Chart and History */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Weight Chart */}
            <WeightChart
              key={`chart-${unit}`}
              weights={weights}
              goal_weight={user_profile?.goal_weight || null}
            />

            {/* Weight History */}
            <WeeklyWeightList
              key={`list-${unit}`}
              weights={weights}
              goal_weight={user_profile?.goal_weight || null}
            />
          </div>
        </div>
      </main>

      {/* Starting Date Selection Modal */}
      <Dialog
        open={show_start_date_modal}
        onOpenChange={set_show_start_date_modal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Total Change Starting Point</DialogTitle>
          </DialogHeader>
          <StartingDateForm
            current_start_date={user_profile?.total_change_start_date || null}
            weights={weights}
            on_success={() => set_show_start_date_modal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
