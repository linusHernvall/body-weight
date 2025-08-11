"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { use_weights, use_user_profile } from "@/hooks/use-weights";
import { testSupabaseConnection } from "@/lib/test-connection";
import { DashboardCard } from "@/components/dashboard-card";
import { WeightForm } from "@/components/weight-form";
import { WeightChart } from "@/components/weight-chart";
import { WeeklyWeightList } from "@/components/weekly-weight-list";
import { GoalWeightForm } from "@/components/goal-weight-form";
import { SettingsMenu } from "@/components/settings-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { calculate_dashboard_stats } from "@/lib/utils";
import { Scale } from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();
  const { data: weights = [], isLoading: weights_loading } = use_weights();
  const { data: user_profile, isLoading: profile_loading } = use_user_profile();
  const [selected_date, set_selected_date] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const stats = calculate_dashboard_stats(
    weights,
    user_profile?.goal_weight || null
  );
  const today_weight = weights.find((w) => w.date === selected_date);

  // Test connection on component mount
  useEffect(() => {
    testSupabaseConnection();
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
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">MassLog</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SettingsMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms and Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Weight Form */}
            <WeightForm
              selected_date={selected_date}
              existing_weight={today_weight}
            />

            {/* Goal Weight Form */}
            <GoalWeightForm
              current_goal_weight={user_profile?.goal_weight || null}
            />

            {/* Dashboard Stats */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Stats</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <DashboardCard
                  title="Current Weight"
                  value={stats.current_weight}
                  unit="kg"
                />
                <DashboardCard
                  title="Weekly Change"
                  value={stats.weight_change_week}
                  change={stats.weight_change_week}
                  unit="kg"
                />
                <DashboardCard
                  title="Total Change"
                  value={stats.total_change}
                  change={stats.total_change}
                  unit="kg"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Chart and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weight Chart */}
            <WeightChart
              weights={weights}
              goal_weight={user_profile?.goal_weight || null}
            />

            {/* Weight History */}
            <WeeklyWeightList
              weights={weights}
              goal_weight={user_profile?.goal_weight || null}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
