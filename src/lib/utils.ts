import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export function format_date_whole_month(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "long" });
  return `${day} ${month}`;
}

export function format_date(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "short" });
  return `${day} ${month}`;
}

export function get_week_start(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Monday is 1, Sunday is 0, so we need to adjust accordingly
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const week_start = new Date(d);
  week_start.setDate(diff);
  return week_start;
}

export function get_week_end(date: Date): Date {
  const week_start = get_week_start(date);
  const week_end = new Date(week_start);
  week_end.setDate(week_end.getDate() + 6);
  return week_end;
}

export function get_week_key(date: Date): string {
  const week_start = get_week_start(date);
  return week_start.toISOString().split("T")[0];
}

export function format_week_range(
  week_start: string,
  week_end: string
): string {
  const start_date = new Date(week_start);
  const end_date = new Date(week_end);

  const start_day = start_date.getDate();
  const start_month = start_date.toLocaleDateString("en-US", {
    month: "short",
  });
  const end_day = end_date.getDate();
  const end_month = end_date.toLocaleDateString("en-US", { month: "short" });

  if (start_date.getMonth() === end_date.getMonth()) {
    return `${start_day} ${start_month} - ${end_day} ${start_month}`;
  } else {
    return `${start_day} ${start_month} - ${end_day} ${end_month}`;
  }
}

export function is_current_week(week_start: string): boolean {
  const current_week_start = get_week_start(new Date());
  return week_start === current_week_start.toISOString().split("T")[0];
}

export function is_previous_week(week_start: string): boolean {
  const current_week_start = get_week_start(new Date());
  const previous_week_start = new Date(current_week_start);
  previous_week_start.setDate(previous_week_start.getDate() - 7);
  return week_start === previous_week_start.toISOString().split("T")[0];
}

// Weight calculation utilities
export function calculate_weekly_averages(
  weights: Array<{
    id: string;
    date: string;
    value: number;
    user_id: string;
    created_at: string;
  }>
): Array<{
  week_start: string;
  week_end: string;
  average: number;
  count: number;
  weights: Array<{
    id: string;
    date: string;
    value: number;
    user_id: string;
    created_at: string;
  }>;
}> {
  const weekly_data: {
    [key: string]: Array<{
      id: string;
      date: string;
      value: number;
      user_id: string;
      created_at: string;
    }>;
  } = {};

  weights.forEach((weight) => {
    const date = new Date(weight.date);
    const week_key = get_week_key(date);

    if (!weekly_data[week_key]) {
      weekly_data[week_key] = [];
    }
    weekly_data[week_key].push(weight);
  });

  return Object.entries(weekly_data)
    .map(([week_start, week_weights]) => {
      const week_end = get_week_end(new Date(week_start));
      const values = week_weights.map((w) => w.value);
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;

      return {
        week_start,
        week_end: week_end.toISOString().split("T")[0],
        average: Math.round(average * 10) / 10, // Round to 1 decimal place
        count: values.length,
        weights: week_weights.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      };
    })
    .sort(
      (a, b) =>
        new Date(b.week_start).getTime() - new Date(a.week_start).getTime()
    );
}

// Helper function to calculate weekly averages from simplified weight data
function calculate_weekly_averages_simple(
  weights: Array<{ date: string; value: number }>
): Array<{
  week_start: string;
  week_end: string;
  average: number;
  count: number;
}> {
  const weekly_data: {
    [key: string]: Array<{ date: string; value: number }>;
  } = {};

  weights.forEach((weight) => {
    const date = new Date(weight.date);
    const week_key = get_week_key(date);

    if (!weekly_data[week_key]) {
      weekly_data[week_key] = [];
    }
    weekly_data[week_key].push(weight);
  });

  return Object.entries(weekly_data)
    .map(([week_start, week_weights]) => {
      const week_end = get_week_end(new Date(week_start));
      const values = week_weights.map((w) => w.value);
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;

      return {
        week_start,
        week_end: week_end.toISOString().split("T")[0],
        average: Math.round(average * 10) / 10, // Round to 1 decimal place
        count: values.length,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.week_start).getTime() - new Date(a.week_start).getTime()
    );
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

  // Calculate weekly averages for more accurate weekly change
  const weekly_averages = calculate_weekly_averages_simple(weights);

  // Get current week average
  const current_week_average = weekly_averages.find((week) =>
    is_current_week(week.week_start)
  )?.average;

  // Get previous week average
  const previous_week_average = weekly_averages.find((week) =>
    is_previous_week(week.week_start)
  )?.average;

  // Calculate weekly change using weekly averages
  const weight_change_week =
    current_week_average && previous_week_average
      ? current_week_average - previous_week_average
      : null;

  // Calculate current week average (for display purposes)
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

// Weight formatting utility
export function format_weight_value(
  value: number,
  unit: string = "kg"
): string {
  return `${value.toFixed(1)} ${unit}`;
}
