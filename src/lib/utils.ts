import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export function format_date(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function get_week_start(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

export function get_week_end(date: Date): Date {
  const week_start = get_week_start(date);
  const week_end = new Date(week_start);
  week_end.setDate(week_end.getDate() + 6);
  return week_end;
}

// Weight calculation utilities
export function calculate_weekly_averages(
  weights: Array<{ date: string; value: number }>
) {
  const weekly_data: { [key: string]: number[] } = {};

  weights.forEach((weight) => {
    const date = new Date(weight.date);
    const week_start = get_week_start(date);
    const week_key = week_start.toISOString().split("T")[0];

    if (!weekly_data[week_key]) {
      weekly_data[week_key] = [];
    }
    weekly_data[week_key].push(weight.value);
  });

  return Object.entries(weekly_data).map(([week_start, values]) => ({
    week_start,
    week_end: get_week_end(new Date(week_start)).toISOString().split("T")[0],
    average: values.reduce((sum, val) => sum + val, 0) / values.length,
    count: values.length,
  }));
}

export function calculate_dashboard_stats(
  weights: Array<{ date: string; value: number }>,
  goal_weight: number | null
): {
  current_weight: number | null;
  weight_change_week: number | null;
  total_change: number | null;
  weekly_average: number | null;
} {
  if (weights.length === 0) {
    return {
      current_weight: null,
      weight_change_week: null,
      total_change: null,
      weekly_average: null,
    };
  }

  const sorted_weights = [...weights].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const current_weight = sorted_weights[0].value;
  const first_weight = sorted_weights[sorted_weights.length - 1].value;
  const total_change = current_weight - first_weight;

  // Calculate weekly change
  const one_week_ago = new Date();
  one_week_ago.setDate(one_week_ago.getDate() - 7);
  const week_ago_weight = sorted_weights.find(
    (w) => new Date(w.date) <= one_week_ago
  )?.value;

  const weight_change_week = week_ago_weight
    ? current_weight - week_ago_weight
    : null;

  // Calculate current week average
  const current_week_start = get_week_start(new Date());
  const current_week_weights = sorted_weights.filter(
    (w) => new Date(w.date) >= current_week_start
  );

  const weekly_average =
    current_week_weights.length > 0
      ? current_week_weights.reduce((sum, w) => sum + w.value, 0) /
        current_week_weights.length
      : null;

  return {
    current_weight,
    weight_change_week,
    total_change,
    weekly_average,
  };
}

// Color utilities for weight comparison
export function get_weight_color(current: number, goal: number | null): string {
  if (!goal) return "text-foreground";

  const diff = current - goal;
  const percentage = (Math.abs(diff) / goal) * 100;

  if (percentage < 2) return "text-green-600 dark:text-green-400";
  if (percentage < 5) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

// Weight formatting utility
export function format_weight_value(
  value: number,
  unit: string = "kg"
): string {
  return `${value.toFixed(1)} ${unit}`;
}
