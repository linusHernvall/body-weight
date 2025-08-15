"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Weight } from "@/types";
import { format_date, format_weight_value } from "@/lib/utils";

interface WeightChartProps {
  weights: Weight[];
  goal_weight: number | null;
}

export function WeightChart({ weights, goal_weight }: WeightChartProps) {
  if (weights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>No weight data recorded yet</p>
              <p className="text-sm">
                Start tracking your weight to see your progress
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort weights by date
  const sorted_weights = weights.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate the date range for the chart
  const today = new Date();
  const one_month_ago = new Date(today);
  one_month_ago.setMonth(today.getMonth() - 1);

  const first_recorded_date = new Date(sorted_weights[0].date);
  const last_recorded_date = new Date(
    sorted_weights[sorted_weights.length - 1].date
  );

  // Determine the start date for the chart
  // If we have data from a month ago, start from a month ago
  // Otherwise, start from the first recorded date
  const chart_start_date =
    first_recorded_date <= one_month_ago ? one_month_ago : first_recorded_date;

  // Filter weights to show only the relevant date range
  const filtered_weights = sorted_weights.filter((weight) => {
    const weight_date = new Date(weight.date);
    return weight_date >= chart_start_date && weight_date <= today;
  });

  // Format data for chart
  const chart_data = filtered_weights.map((weight) => ({
    date: format_date(weight.date),
    weight: weight.value,
    goal: goal_weight,
    raw_date: weight.date, // Keep raw date for custom tick formatting
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-primary">
            Weight: {format_weight_value(payload[0].value)}
          </p>
          {goal_weight && (
            <p className="text-muted-foreground">
              Goal: {format_weight_value(goal_weight)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom tick formatter to show only first and last dates
  const CustomTick = ({ x, y, payload }: any) => {
    const is_first = payload.index === 0;
    const is_last = payload.index === chart_data.length - 1;

    if (!is_first && !is_last) {
      return null;
    }

    return (
      <text
        x={x}
        y={y}
        dy={16}
        textAnchor="middle"
        className="text-xs fill-foreground"
      >
        {payload.value}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Weight Progress</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chart_data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={<CustomTick />}
              interval="preserveStartEnd"
              axisLine={true}
              tickLine={false}
            />
            <YAxis
              className="text-xs fill-foreground"
              tick={{ fontSize: 12, fill: "currentColor" }}
              domain={["dataMin - 2", "dataMax + 2"]}
              axisLine={true}
              tickLine={true}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            {goal_weight && (
              <Line
                type="monotone"
                dataKey="goal"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
